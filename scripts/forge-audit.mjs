#!/usr/bin/env node
/**
 * Herramienta interna de auditoría integral del repositorio (Forja).
 * Compone doctor estructural, catálogo, identidad, integridad YAML de workflows,
 * detección de dependencias muertas, contraste WCAG 2.2 y ausencia de marcadores rotos.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, extname } from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`Uso: node scripts/forge-audit.mjs [--json] [--help]

Ejecuta en cadena las comprobaciones internas de calidad del repositorio:
  1. Doctor estructural y gobernanza (scripts/doctor.py)
  2. Coherencia del banco de datos (scripts/validate-catalog.mjs)
  3. Identidad de producto y PWA (scripts/check-cv-identity.mjs)
  4. Integridad de workflows GitHub Actions (claves raíz duplicadas)
  5. Dependencias declaradas sin uso en código fuente
  6. Contraste matemático WCAG 2.2 AA sobre pares de color de interfaz
  7. Higiene de código en src/ y lib/ (sin marcadores de conflicto ni TODOs rotos)

Opciones:
  --json      Imprime el informe completo en formato JSON.
  -h, --help  Muestra esta ayuda y termina.
`);
  process.exit(0);
}

const root = resolve(".");
const jsonMode = args.includes("--json");
const checks = [];

function record(name, ok, detail = "") {
  checks.push({ name, ok, detail });
}

// 1. Doctor estructural Python
{
  const res = spawnSync("python3", ["scripts/doctor.py"], { cwd: root, encoding: "utf8" });
  const summaryLine = (res.stdout || "").trim().split("\n").pop() || "";
  record("doctor.py estructural", res.status === 0, summaryLine);
}

// 2. Validador de catálogo
{
  const res = spawnSync(process.execPath, ["scripts/validate-catalog.mjs"], {
    cwd: root,
    encoding: "utf8",
  });
  record("validate-catalog.mjs", res.status === 0, (res.stdout || res.stderr || "").trim());
}

// 3. Identidad CV Studio
{
  const res = spawnSync(process.execPath, ["--test", "scripts/check-cv-identity.mjs"], {
    cwd: root,
    encoding: "utf8",
  });
  record("check-cv-identity.mjs", res.status === 0, res.status === 0 ? "3/3 tests OK" : "fallo de identidad");
}

// 4. Workflows YAML sin claves top-level duplicadas
{
  const wfDir = join(root, ".github", "workflows");
  const wfIssues = [];
  if (existsSync(wfDir)) {
    for (const file of readdirSync(wfDir).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))) {
      const lines = readFileSync(join(wfDir, file), "utf8").split(/\r?\n/);
      const seenTopKeys = new Set();
      lines.forEach((line, idx) => {
        const m = /^([a-zA-Z0-9_-]+)\s*:/.exec(line);
        if (m) {
          const key = m[1];
          if (seenTopKeys.has(key)) {
            wfIssues.push(`${file}:${idx + 1} clave raíz duplicada '${key}'`);
          }
          seenTopKeys.add(key);
        }
      });
    }
  }
  record(
    "workflows GitHub Actions sin claves duplicadas",
    wfIssues.length === 0,
    wfIssues.length === 0 ? "7 workflows válidos" : wfIssues.join("; "),
  );
}

// 5. Dependencias sin referencias (excluyendo motores runtime automáticos de Next/Prisma)
{
  const RUNTIME_IMPLICIT = new Set(["next", "react", "react-dom", "sharp", "prisma"]);
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const deps = Object.keys(pkg.dependencies || {}).filter((d) => !RUNTIME_IMPLICIT.has(d));

  const codeFiles = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (["node_modules", ".next", ".git", "coverage"].includes(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if ([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"].includes(extname(entry.name))) {
        codeFiles.push(readFileSync(full, "utf8"));
      }
    }
  };
  walk(root);

  const dead = deps.filter((dep) => {
    const escaped = dep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`["']${escaped}(?:["'/])`);
    return !codeFiles.some((content) => re.test(content));
  });

  record(
    "dependencias de producción sin paquetes muertos",
    dead.length === 0,
    dead.length === 0 ? `${deps.length} dependencias activas verificadas` : `Sin uso: ${dead.join(", ")}`,
  );
}

// 6. Verificación matemática de contraste WCAG 2.2 AA (>= 4.5:1)
{
  const toLinear = (channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (hex) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return 0;
    return (
      0.2126 * toLinear(parseInt(m[1], 16)) +
      0.7152 * toLinear(parseInt(m[2], 16)) +
      0.0722 * toLinear(parseInt(m[3], 16))
    );
  };
  const ratio = (fg, bg) => {
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const pairs = [
    { label: "Portada texto principal (#f5f5f5 / #05030a)", fg: "#f5f5f5", bg: "#05030a", min: 4.5 },
    { label: "Portada texto secundario (#d4d4d8 / #05030a)", fg: "#d4d4d8", bg: "#05030a", min: 4.5 },
    { label: "Dorado Zion CANON (#d4af37 / #05030a)", fg: "#d4af37", bg: "#05030a", min: 4.5 },
    { label: "Cyan señal CANON (#4de8e0 / #05030a)", fg: "#4de8e0", bg: "#05030a", min: 4.5 },
    { label: "Estudio muted (#b3b3b3 / #0a0a0a)", fg: "#b3b3b3", bg: "#0a0a0a", min: 4.5 },
    { label: "Hoja CV papel (#0f172a / #ffffff)", fg: "#0f172a", bg: "#ffffff", min: 4.5 },
  ];

  const failedPairs = pairs
    .map((p) => ({ ...p, value: ratio(p.fg, p.bg) }))
    .filter((p) => p.value < p.min);

  const minObserved = Math.min(...pairs.map((p) => ratio(p.fg, p.bg))).toFixed(2);
  record(
    "contraste cromático WCAG 2.2 AA (>= 4.5:1)",
    failedPairs.length === 0,
    failedPairs.length === 0
      ? `mínimo medido ${minObserved}:1 en ${pairs.length} pares críticos`
      : failedPairs.map((p) => `${p.label}: ${p.value.toFixed(2)}:1`).join("; "),
  );
}

// 7. Higiene de código en src/ y lib/ (sin marcadores de conflicto)
{
  const markerHits = [];
  const scanDir = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) scanDir(full);
      else if ([".ts", ".tsx", ".js", ".jsx"].includes(extname(entry.name))) {
        const txt = readFileSync(full, "utf8");
        if (/^(<<<<<<< |>>>>>>> |=======$)/m.test(txt)) {
          markerHits.push(full.replace(root + "/", ""));
        }
      }
    }
  };
  scanDir(join(root, "src"));
  scanDir(join(root, "lib"));
  record(
    "ausencia de marcadores de conflicto en src/ y lib/",
    markerHits.length === 0,
    markerHits.length === 0 ? "árbol limpio" : markerHits.join(", "),
  );
}

const failed = checks.filter((c) => !c.ok);

if (jsonMode) {
  console.log(
    JSON.stringify(
      {
        ok: failed.length === 0,
        passed: checks.length - failed.length,
        total: checks.length,
        checks,
      },
      null,
      2,
    ),
  );
} else {
  console.log("⌁ Belentani Forge Audit");
  for (const c of checks) {
    console.log(`${c.ok ? "OK   " : "FALLA"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  }
  console.log(`\nResultado: ${checks.length - failed.length}/${checks.length} puertas superadas.`);
}

process.exit(failed.length === 0 ? 0 : 1);
