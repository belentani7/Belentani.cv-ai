#!/usr/bin/env node
/**
 * Auditoría automatizada de Rendimiento, Cabeceras HTTP y Accesibilidad Semántica (WCAG 2.2).
 * Puede auditar un servidor en ejecución (--url=http://127.0.0.1:3000) o levantar
 * automáticamente una instancia efímera de `next start` sobre el build de producción `.next`.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { spawn } from "node:child_process";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`Uso: node scripts/a11y-perf-audit.mjs [--url=<http://host:puerto>] [--json] [--help]

Audita sobre el servidor real de producción:
  - Tiempos de respuesta TTFB en frío y en caliente (ms)
  - Presupuesto de transferencia HTML y JS inicial comprimido (gzip KB vs budget.json)
  - Ausencia de peticiones externas bloqueantes a Google Fonts
  - Cabeceras de seguridad y no-store en endpoints privados (/api)
  - Semántica y accesibilidad WCAG 2.2 AA en /, /cv y /cv/preparar:
    * <!DOCTYPE html>, lang="es", meta viewport, <main>, skip-link
    * Exactamente un encabezado <h1> por documento
    * Todos los <button> con nombre accesible (texto visible o aria-label)
    * Todos los controles <input>/<textarea> asociados a <label> o aria-label

Opciones:
  --url=<url>  Audita un servidor ya levantado en lugar de iniciar uno efímero.
  --json       Devuelve el informe estructurado en JSON.
  -h, --help   Muestra esta ayuda y termina.
`);
  process.exit(0);
}

const jsonMode = args.includes("--json");
const explicitUrl = args.find((a) => a.startsWith("--url="))?.slice(6);
const root = resolve(".");

/**
 * Extrae el texto visible de un fragmento HTML mediante recorrido lineal de caracteres
 * (sin expresiones regulares de saneamiento parcial) e ignora subárboles no textuales.
 */
function extractVisibleText(fragment) {
  let out = "";
  let i = 0;
  let ignoredDepth = 0;
  const ignoredTags = new Set(["svg", "script", "style"]);

  while (i < fragment.length) {
    if (fragment[i] === "<") {
      const closeIdx = fragment.indexOf(">", i + 1);
      if (closeIdx === -1) break;
      const rawTag = fragment.slice(i + 1, closeIdx).trim().toLowerCase();
      const isClosing = rawTag.startsWith("/");
      const isSelfClosing = rawTag.endsWith("/");
      const tagBody = isClosing ? rawTag.slice(1).trim() : rawTag;
      const tagName = tagBody.split(/[\s/]/)[0] || "";

      if (ignoredTags.has(tagName)) {
        if (isClosing) {
          ignoredDepth = Math.max(0, ignoredDepth - 1);
        } else if (!isSelfClosing) {
          ignoredDepth += 1;
        }
      }
      out += " ";
      i = closeIdx + 1;
    } else {
      if (ignoredDepth === 0) {
        out += fragment[i];
      }
      i += 1;
    }
  }

  return out.replaceAll("&nbsp;", " ").replace(/\s+/g, " ").trim();
}

function hasExternalGoogleFontUrl(html) {
  const attrUrlRegex = /\b(?:href|src)=["']([^"']+)["']/gi;
  let match;
  while ((match = attrUrlRegex.exec(html)) !== null) {
    try {
      const parsed = new URL(match[1], "https://belentani.local");
      if (
        parsed.hostname === "fonts.googleapis.com" ||
        parsed.hostname === "fonts.gstatic.com"
      ) {
        return true;
      }
    } catch {
      // atributo no parseable como URL estándar
    }
  }
  return false;
}

function auditHtmlAccessibility(route, html) {
  const issues = [];
  if (!/<!doctype html>/i.test(html)) issues.push(`${route}: falta <!DOCTYPE html>`);
  if (!/<html[^>]*\blang=["'][a-z-]+["']/i.test(html)) issues.push(`${route}: falta atributo lang en <html>`);
  if (!/<meta[^>]*name=["']viewport["']/i.test(html)) issues.push(`${route}: falta meta viewport`);
  if (!/<main\b/i.test(html)) issues.push(`${route}: falta landmark <main>`);
  if (hasExternalGoogleFontUrl(html)) {
    issues.push(`${route}: dependencia externa a Google Fonts detectada`);
  }

  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1Matches.length !== 1) {
    issues.push(`${route}: se esperaba exactamente 1 <h1> y se encontraron ${h1Matches.length}`);
  }

  if (!/<a[^>]*href=["']#[a-z0-9_-]+["'][^>]*>/i.test(html)) {
    issues.push(`${route}: falta enlace de salto al contenido principal (skip-link)`);
  }

  const buttonRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let btnMatch;
  while ((btnMatch = buttonRegex.exec(html)) !== null) {
    const attrs = btnMatch[1];
    const innerText = extractVisibleText(btnMatch[2]);
    const hasAria = /\baria-label=["'][^"']+["']|\baria-labelledby=["'][^"']+["']|\btitle=["'][^"']+["']/i.test(attrs);
    if (!innerText && !hasAria) {
      issues.push(`${route}: <button> sin nombre accesible (${attrs.trim().slice(0, 60)})`);
    }
  }

  const labelIds = new Set(
    [...html.matchAll(/<label\b[^>]*\bfor=["']([^"']+)["']/gi)].map((m) => m[1]),
  );
  const controlRegex = /<(input|textarea)\b([^>]*)>/gi;
  let ctrlMatch;
  while ((ctrlMatch = controlRegex.exec(html)) !== null) {
    const attrs = ctrlMatch[2];
    if (/\btype=["']hidden["']/i.test(attrs)) continue;
    const id = /\bid=["']([^"']+)["']/i.exec(attrs)?.[1];
    const hasAria = /\baria-label=["'][^"']+["']|\baria-labelledby=["'][^"']+["']/i.test(attrs);
    if (!hasAria && (!id || !labelIds.has(id))) {
      const pos = ctrlMatch.index;
      const before = html.slice(Math.max(0, pos - 400), pos);
      const wrappedInLabel = before.lastIndexOf("<label") > before.lastIndexOf("</label");
      if (!wrappedInLabel) {
        issues.push(`${route}: control <${ctrlMatch[1]}> sin etiqueta accesible (${attrs.trim().slice(0, 60)})`);
      }
    }
  }

  return { h1Count: h1Matches.length, issues };
}

function measureInitialJsKb(html) {
  const chunkNames = [
    ...new Set([...html.matchAll(/\/_next\/static\/chunks\/([^"']+?\.js)/g)].map((m) => m[1])),
  ];
  let rawBytes = 0;
  let gzipBytes = 0;
  for (const name of chunkNames) {
    const file = join(root, ".next", "static", "chunks", name);
    if (existsSync(file)) {
      const buf = readFileSync(file);
      rawBytes += buf.length;
      gzipBytes += gzipSync(buf).length;
    }
  }
  return {
    chunks: chunkNames.length,
    rawKb: +(rawBytes / 1024).toFixed(1),
    gzipKb: +(gzipBytes / 1024).toFixed(1),
  };
}

async function waitForServer(baseUrl, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/api`);
      if (res.ok) return;
    } catch {
      // reintento
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`El servidor en ${baseUrl} no respondió en ${timeoutMs}ms`);
}

async function run() {
  if (!existsSync(join(root, ".next", "BUILD_ID"))) {
    console.error("Error: ejecuta `pnpm run build` antes de `a11y-perf-audit.mjs`.");
    process.exit(1);
  }

  let serverProc = null;
  const port = 3417;
  const baseUrl = explicitUrl || `http://127.0.0.1:${port}`;

  if (!explicitUrl) {
    const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
    serverProc = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)], {
      cwd: root,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: "ignore",
    });
  }

  try {
    await waitForServer(baseUrl);

    const budgetFile = join(root, ".github", "lighthouse", "budget.json");
    const budgets = existsSync(budgetFile) ? JSON.parse(readFileSync(budgetFile, "utf8"))[0] : null;
    const scriptBudgetKb =
      budgets?.resourceSizes?.find((r) => r.resourceType === "script")?.budget ?? 380;
    const docBudgetKb =
      budgets?.resourceSizes?.find((r) => r.resourceType === "document")?.budget ?? 60;

    const pages = ["/", "/cv", "/cv/preparar"];
    const routeMetrics = [];
    const allIssues = [];

    for (const route of pages) {
      const t0 = performance.now();
      const coldRes = await fetch(`${baseUrl}${route}`);
      const coldHtml = await coldRes.text();
      const coldMs = +(performance.now() - t0).toFixed(1);

      const t1 = performance.now();
      const warmRes = await fetch(`${baseUrl}${route}`);
      await warmRes.text();
      const warmMs = +(performance.now() - t1).toFixed(1);

      if (coldRes.status !== 200) {
        allIssues.push(`${route}: código HTTP inesperado ${coldRes.status}`);
      }

      const htmlRawKb = +(Buffer.byteLength(coldHtml) / 1024).toFixed(1);
      const htmlGzipKb = +(gzipSync(coldHtml).length / 1024).toFixed(1);
      const js = measureInitialJsKb(coldHtml);
      const a11y = auditHtmlAccessibility(route, coldHtml);
      allIssues.push(...a11y.issues);

      if (htmlGzipKb > docBudgetKb) {
        allIssues.push(`${route}: HTML gzip (${htmlGzipKb} KB) supera presupuesto (${docBudgetKb} KB)`);
      }
      if (js.gzipKb > scriptBudgetKb) {
        allIssues.push(`${route}: JS inicial gzip (${js.gzipKb} KB) supera presupuesto (${scriptBudgetKb} KB)`);
      }

      for (const header of ["x-content-type-options", "referrer-policy", "strict-transport-security"]) {
        if (!coldRes.headers.get(header)) {
          allIssues.push(`${route}: falta cabecera de seguridad ${header}`);
        }
      }

      routeMetrics.push({
        route,
        status: coldRes.status,
        coldTtfbMs: coldMs,
        warmTtfbMs: warmMs,
        htmlRawKb,
        htmlGzipKb,
        jsRawKb: js.rawKb,
        jsGzipKb: js.gzipKb,
        jsChunks: js.chunks,
        h1Count: a11y.h1Count,
        a11yIssues: a11y.issues.length,
      });
    }

    const apiRes = await fetch(`${baseUrl}/api`);
    const apiJson = await apiRes.json();
    const apiCache = apiRes.headers.get("cache-control") || "";
    if (apiRes.status !== 200 || apiJson.status !== "operational") {
      allIssues.push(`/api: respuesta inesperada (${apiRes.status})`);
    }
    if (!apiCache.includes("no-store")) {
      allIssues.push(`/api: falta Cache-Control no-store (${apiCache})`);
    }

    for (const metaRoute of ["/robots.txt", "/sitemap.xml"]) {
      const r = await fetch(`${baseUrl}${metaRoute}`);
      if (r.status !== 200) allIssues.push(`${metaRoute}: HTTP ${r.status}`);
    }

    const report = {
      ok: allIssues.length === 0,
      budgets: { docBudgetKb, scriptBudgetKb },
      routes: routeMetrics,
      issues: allIssues,
    };

    if (jsonMode) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log("⌁ Belentani A11y & Performance Audit");
      for (const m of routeMetrics) {
        console.log(
          `OK   ${m.route.padEnd(14)} HTTP ${m.status} | TTFB warm ${String(m.warmTtfbMs).padStart(5)}ms | HTML ${m.htmlGzipKb}KB gz | JS ${m.jsGzipKb}KB gz (${m.jsRawKb}KB raw) | h1=${m.h1Count} | a11y=${m.a11yIssues === 0 ? "PASS" : "FAIL"}`,
        );
      }
      for (const issue of allIssues) {
        console.error(`FALLA ${issue}`);
      }
      console.log(
        allIssues.length === 0
          ? "\nResultado: 100 % de auditorías de rendimiento, cabeceras y accesibilidad superadas."
          : `\nResultado: ${allIssues.length} incidencias detectadas.`,
      );
    }

    process.exitCode = allIssues.length === 0 ? 0 : 1;
  } finally {
    if (serverProc) {
      serverProc.kill("SIGTERM");
    }
  }
}

void run();
