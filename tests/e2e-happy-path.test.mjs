import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

const root = resolve(".");
const port = 3429;
const baseUrl = `http://127.0.0.1:${port}`;

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/api`);
      if (res.ok) return;
    } catch {
      // servidor arrancando
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Servidor Next.js no disponible en ${url} tras ${timeoutMs}ms`);
}

test("E2E happy-path: flujo completo de usuario y contratos HTTP sobre servidor de producción", async (t) => {
  assert.ok(
    existsSync(join(root, ".next", "BUILD_ID")),
    "El build de producción (.next/BUILD_ID) debe existir antes de ejecutar el test E2E",
  );

  const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
  const server = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: root,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "ignore",
  });

  t.after(() => {
    server.kill("SIGTERM");
  });

  await waitForServer(baseUrl);

  // Paso 1: Portada editorial (/), fuentes autoalojadas y cabeceras de seguridad
  const homeRes = await fetch(`${baseUrl}/`);
  assert.equal(homeRes.status, 200);
  assert.equal(homeRes.headers.get("x-frame-options"), "DENY");
  assert.equal(homeRes.headers.get("x-content-type-options"), "nosniff");
  const homeHtml = await homeRes.text();
  assert.match(homeHtml, /Tu trayectoria\./);
  assert.match(homeHtml, /href="\/cv"/);
  assert.match(homeHtml, /href="\/cv\/preparar"/);
  assert.doesNotMatch(homeHtml, /fonts\.googleapis\.com/);

  // Verificar que el activo woff2 autoalojado de Geist responde 200 OK
  const fontMatch = /href="(\/_next\/static\/media\/[^"]+\.woff2)"/.exec(homeHtml);
  assert.ok(fontMatch, "La portada debe precargar la tipografía Geist autoalojada (.woff2)");
  const fontRes = await fetch(`${baseUrl}${fontMatch[1]}`);
  assert.equal(fontRes.status, 200);

  // Paso 2: Estudio principal (/cv) con pestañas de Currículum, Oferta/ATS y Carta
  const cvRes = await fetch(`${baseUrl}/cv`);
  assert.equal(cvRes.status, 200);
  const cvHtml = await cvRes.text();
  assert.equal([...cvHtml.matchAll(/<h1\b/gi)].length, 1, "/cv debe tener un único <h1>");
  assert.match(cvHtml, /Adaptar a oferta · ATS/);
  assert.match(cvHtml, /Carta de presentación/);

  // Paso 3: Revisión final antes de enviar (/cv/preparar)
  const prepRes = await fetch(`${baseUrl}/cv/preparar`);
  assert.equal(prepRes.status, 200);
  const prepHtml = await prepRes.text();
  assert.equal([...prepHtml.matchAll(/<h1\b/gi)].length, 1, "/cv/preparar debe tener un único <h1>");
  assert.match(prepHtml, /Un CV listo para/);

  // Paso 4: Endpoints API de CV y privacidad de cabeceras (sin caché compartida + degradación 503 honesta sin API key)
  const apiRes = await fetch(`${baseUrl}/api`);
  assert.equal(apiRes.status, 200);
  assert.match(apiRes.headers.get("cache-control") ?? "", /no-store/);
  const apiData = await apiRes.json();
  assert.equal(apiData.status, "operational");

  const readyRes = await fetch(`${baseUrl}/api/ready`);
  assert.ok([200, 503].includes(readyRes.status), "/api/ready responde JSON limpio sin caer en 500");

  const genInvalidRes = await fetch(`${baseUrl}/api/cv/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: baseUrl,
    },
    body: JSON.stringify({ field: "summary", data: {} }),
  });
  assert.ok(
    [400, 503].includes(genInvalidRes.status),
    "POST /api/cv/generate valida entrada o degrada limpiamente a 503 sin ZAI_API_KEY",
  );
  assert.match(genInvalidRes.headers.get("cache-control") ?? "", /no-store/);

  // Paso 5: Metadatos de indexación (/sitemap.xml y /robots.txt)
  const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
  assert.equal(sitemapRes.status, 200);
  const sitemapXml = await sitemapRes.text();
  assert.match(sitemapXml, /\/cv<\/loc>/);
  assert.match(sitemapXml, /\/cv\/preparar<\/loc>/);

  const robotsRes = await fetch(`${baseUrl}/robots.txt`);
  assert.equal(robotsRes.status, 200);
  const robotsTxt = await robotsRes.text();
  assert.match(robotsTxt, /Disallow: \/api\//);
});
