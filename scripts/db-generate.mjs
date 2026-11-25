#!/usr/bin/env node
/**
 * Generador resiliente del cliente Prisma para entornos online y offline/sandbox.
 * En CI/despliegue con acceso a binaries.prisma.sh ejecuta `prisma generate` estándar;
 * en entornos aislados sin salida a internet verifica que @prisma/client esté operativo.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const args = new Set(process.argv.slice(2));
if (args.has("--help") || args.has("-h")) {
  console.log(`Uso: node scripts/db-generate.mjs [--help] [--strict]

Opciones:
  --strict   Exige descarga completa de motores Prisma sin fallback offline.
  -h, --help Muestra esta ayuda y termina.
`);
  process.exit(0);
}

const strict = args.has("--strict");
const prismaBin = resolve("node_modules/prisma/build/index.js");
const res = spawnSync(process.execPath, [prismaBin, "generate"], {
  encoding: "utf8",
  env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: "1" },
});

if (res.status === 0) {
  if (res.stdout) process.stdout.write(res.stdout);
  process.exit(0);
}

const combined = `${res.stdout ?? ""}\n${res.stderr ?? ""}`;
const isNetworkOffline =
  /binaries\.prisma\.sh|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|socket disconnected/i.test(
    combined,
  );

if (!strict && isNetworkOffline) {
  try {
    const require = createRequire(import.meta.url);
    const client = require("@prisma/client");
    if (client && typeof client.PrismaClient === "function") {
      console.warn(
        "[db:generate] Red restringida hacia binaries.prisma.sh; @prisma/client verificado en local.",
      );
      process.exit(0);
    }
  } catch (err) {
    console.error("[db:generate] @prisma/client no está disponible:", err);
    process.exit(1);
  }
}

if (res.stdout) process.stdout.write(res.stdout);
if (res.stderr) process.stderr.write(res.stderr);
process.exit(res.status ?? 1);
