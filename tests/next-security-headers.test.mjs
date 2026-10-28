import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');

test('all HTTP responses include baseline browser protection headers', () => {
  for (const header of ['X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']) {
    assert.ok(config.includes(`key: "${header}"`), `Missing ${header}`);
  }
  assert.match(config, /max-age=31536000/);
  assert.doesNotMatch(config, /includeSubDomains|preload/);
});

test('private API routes explicitly disable browser and shared cache storage', () => {
  assert.match(config, /source:\s*"\\/api\\/:path\\*"/);
  assert.match(config, /private, no-store, max-age=0/);
  assert.match(config, /Pragma/);
});

test('Vercel is not forced to output standalone build artifacts', () => {
  assert.doesNotMatch(config, /^\\s*output:\\s*["']standalone["']/m);
});
