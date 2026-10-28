import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');

test('browser security headers and a scoped HSTS policy are configured', () => {
  for (const header of ['X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']) {
    assert.ok(config.includes('key: "' + header + '"'), 'Missing ' + header);
  }
  assert.ok(config.includes('key: "Strict-Transport-Security", value: "max-age=31536000"'));
});

test('private API responses have an explicit no-store policy', () => {
  assert.ok(config.includes('source: "/api/:path*"'));
  assert.ok(config.includes('private, no-store, max-age=0'));
  assert.ok(config.includes('key: "Pragma", value: "no-cache"'));
});

test('Vercel retains its native Next.js build output', () => {
  assert.ok(!config.includes('output: "standalone"'));
});
