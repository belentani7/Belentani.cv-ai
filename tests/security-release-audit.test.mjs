import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const audit = resolve("scripts/security-release-audit.mjs");

function inspect({ rootVersion = "16.4.1", packageVersion = "16.4.1", rootPresent = true } = {}) {
  const directory = mkdtempSync(join(tmpdir(), "cv-security-gate-"));
  try {
    writeFileSync(join(directory, "package.json"), JSON.stringify({
      name: "security-gate-test",
      dependencies: { next: "^16.4.1" },
    }));
    const nextBlock = rootPresent ? `      next:\n        specifier: ^16.4.1\n        version: ${rootVersion}(react@19.0.0)\n` : "";
    writeFileSync(join(directory, "pnpm-lock.yaml"),
      `lockfileVersion: '9.0'\nimporters:\n  .:\n    dependencies:\n${nextBlock}packages:\n  next@${packageVersion}:\n    resolution: {integrity: sha512-test}\n`);
    const result = spawnSync(process.execPath, [audit, `--project=${directory}`, "--json"], { encoding: "utf8" });
    assert.equal(result.error, undefined);
    const report = JSON.parse(result.stdout);
    return { report, status: result.status };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

const nextIssues = report => report.issues.filter(issue => /next\.js|pnpm root importer/i.test(issue));

test("rejects vulnerable root Next even when a patched orphan package exists", () => {
  const { report, status } = inspect({ rootVersion: "16.3.8" });
  assert.equal(status, 1);
  assert.match(nextIssues(report).join(" "), /root importer/i);
});

test("accepts a matching patched root importer independently of Node runtime", () => {
  const { report } = inspect();
  assert.deepEqual(nextIssues(report), []);
  assert.deepEqual(report.nextLocked, ["16.4.1"]);
});

test("rejects lockfiles with no root Next dependency", () => {
  const { report } = inspect({ rootPresent: false });
  assert.match(nextIssues(report).join(" "), /root importer/i);
});

test("rejects prerelease root Next even when a stable package is present", () => {
  const { report } = inspect({ rootVersion: "16.4.1-canary.1" });
  assert.match(nextIssues(report).join(" "), /root importer/i);
});

test("rejects root Next version missing from packages", () => {
  const { report } = inspect({ packageVersion: "16.3.8" });
  assert.match(nextIssues(report).join(" "), /root importer/i);
});
