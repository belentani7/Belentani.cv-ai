import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Protect against silently green CI checks and redundant Action runs.
const ci = readFileSync(resolve(process.cwd(), '.github/workflows/ci.yml'), 'utf8');
const manualBuild = readFileSync(resolve(process.cwd(), '.github/workflows/build.yml'), 'utf8');
const securityWorkflow = readFileSync(resolve(process.cwd(), '.github/workflows/security.yml'), 'utf8');
const codeqlWorkflow = readFileSync(resolve(process.cwd(), '.github/workflows/codeql.yml'), 'utf8');
const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};

describe('CI quality-gate contract', () => {
  it.each(['lint', 'typecheck', 'test', 'build'])('has a real %s script', (script) => {
    expect(typeof packageJson.scripts[script]).toBe('string');
    expect(packageJson.scripts[script].trim().length).toBeGreaterThan(0);
  });

  it('does not silently skip required quality checks', () => {
    expect(ci).toContain('run: pnpm run typecheck');
    expect(ci).toContain('run: pnpm run lint');
    expect(ci).toContain('run: pnpm exec jest --coverage --runInBand');
    expect(ci).toContain('run: pnpm run build');
    expect(ci).not.toContain('--if-present');
  });

  it('generates Prisma client before typechecking', () => {
    const generate = ci.indexOf('run: pnpm exec prisma generate');
    const typecheck = ci.indexOf('run: pnpm run typecheck');
    expect(generate).toBeGreaterThan(0);
    expect(typecheck).toBeGreaterThan(generate);
  });

  it('runs secret scanning independently of the application build', () => {
    expect(ci).not.toContain('gitleaks/gitleaks-action@');
    expect(securityWorkflow).toContain('gitleaks/gitleaks-action@v2');
    expect(securityWorkflow).not.toMatch(/\bneeds:/);
    expect(securityWorkflow).toContain('pull_request:');
  });

  it('analyzes JavaScript and TypeScript once in the dedicated CodeQL workflow', () => {
    expect(codeqlWorkflow).toContain('languages: javascript-typescript');
    expect(codeqlWorkflow).toContain('github/codeql-action/analyze@');
    expect(codeqlWorkflow).not.toContain('language: [javascript, typescript]');
    expect(securityWorkflow).not.toContain('github/codeql-action/');
  });

  it('audits real routes, using a failing readiness probe', () => {
    expect(ci).toContain('http://localhost:3000/cv');
    expect(ci).toContain('curl --fail');
    expect(ci).toContain('Next.js server did not become ready');
    expect(ci).not.toContain('http://localhost:3000/privacy');
    expect(ci).not.toContain('http://localhost:3000/terms');
    expect(ci).not.toContain('budgetPath:');
  });

  it('keeps the standalone build available on demand without duplicating PR CI', () => {
    expect(manualBuild).toMatch(/\bon:\s*\n\s*workflow_dispatch:/);
    expect(manualBuild).not.toMatch(/^\s*(push|pull_request):/m);
    expect(manualBuild).toContain('pnpm exec prisma generate');
    expect(manualBuild).toContain('pnpm run typecheck');
    expect(manualBuild).toContain('pnpm exec jest --coverage --runInBand');
    expect(manualBuild).toContain('pnpm run build');
  });
});
