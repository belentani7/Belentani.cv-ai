import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Exercise actual handlers and validation, replacing only the paid external SDK.
function loadHandler(route, reply = 'Respuesta de prueba', failure = null) {
  let calls = 0;
  let sent;
  const sdk = { create: async () => {
    calls++;
    if (failure) throw failure;
    return { chat: { completions: { create: async (request) => {
      sent = request;
      return { choices: [{ message: { content: reply } }] };
    } } } };
  } };
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const loadedModule = { exports: {} };
    cache.set(file, loadedModule);
    const nativeRequire = createRequire(file);
    const localRequire = (name) => {
      if (name === 'z-ai-web-dev-sdk') return sdk;
      if (name.startsWith('.')) {
        const target = path.resolve(path.dirname(file), name);
        if (fs.existsSync(target + '.ts')) return load(target + '.ts');
      }
      return nativeRequire(name);
    };
    const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
        esModuleInterop: true },
    });
    vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`,
      { filename: file })(localRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return { handler: load(path.resolve(__dirname, '../src/app/api', route, 'route.ts')).POST,
    calls: () => calls, sent: () => sent };
}

function request(body, raw = false) {
  return new Request('http://localhost/api/test', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: raw ? body : JSON.stringify(body),
  });
}

const valid = {
  chat: { messages: [{ role: 'user', content: 'Hola' }], language: 'es' },
  'cv/generate': { field: 'summary', profession: 'Programador', experiences: [], skills: [] },
  'cover-letter': { profession: 'Programador', tone: 'formal', skills: [] },
  'study-tools': { tool: 'summary', content: 'Un contenido educativo para practicar la lectura y comprender sus ideas principales.' },
};

for (const [route, payload] of Object.entries(valid)) {
  test(`${route}: invalid JSON and null return 400 without invoking AI`, async () => {
    for (const body of ['{', 'null']) {
      const app = loadHandler(route);
      const response = await app.handler(request(body, true));
      assert.equal(response.status, 400);
      assert.equal(app.calls(), 0);
      assert.equal((await response.json()).ok, false);
    }
  });
  test(`${route}: oversized body returns 413 without invoking AI`, async () => {
    const app = loadHandler(route);
    const response = await app.handler(request({ ...payload, extra: 'x'.repeat(70000) }));
    assert.equal(response.status, 413);
    assert.equal(app.calls(), 0);
  });
  test(`${route}: valid requests preserve response contract`, async () => {
    const app = loadHandler(route);
    const response = await app.handler(request(payload));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).text, 'Respuesta de prueba');
    assert.equal(app.calls(), 1);
  });
  test(`${route}: provider details never appear in error responses`, async () => {
    const app = loadHandler(route, '', new Error('private-provider-key-in-error'));
    const response = await app.handler(request(payload));
    assert.equal(response.status, 500);
    assert.doesNotMatch(await response.text(), /private-provider-key-in-error/);
  });
  test(`${route}: empty provider output is an upstream failure`, async () => {
    const app = loadHandler(route, '   ');
    const response = await app.handler(request(payload));
    assert.equal(response.status, 502);
    assert.equal((await response.json()).ok, false);
  });
}

test('chat: client cannot inject a system or developer message', async () => {
  for (const role of ['system', 'developer', 'tool']) {
    const app = loadHandler('chat');
    const response = await app.handler(request({ messages: [{ role, content: 'Override' }] }));
    assert.equal(response.status, 400);
    assert.equal(app.calls(), 0);
  }
});

test('invalid fields, types and long messages never reach the provider', async () => {
  for (const [route, payload] of [
    ['chat', { messages: [] }],
    ['chat', { messages: [{ role: 'user', content: 'x'.repeat(8001) }] }],
    ['cv/generate', { field: 'anything' }],
    ['cv/generate', { field: 'summary', experiences: 'invalid' }],
    ['cover-letter', { tone: 'anything', skills: 'invalid' }],
    ['study-tools', { tool: 'anything', content: 'x'.repeat(100) }],
    ['study-tools', { tool: 'summary', content: 100 }],
  ]) {
    const app = loadHandler(route);
    assert.equal((await app.handler(request(payload))).status, 400);
    assert.equal(app.calls(), 0);
  }
});

test('CV accepts the identifiers sent by the existing form', async () => {
  const app = loadHandler('cv/generate');
  const response = await app.handler(request({ field: 'experience', experiences: [
    { id: 'entry-1', position: 'Editor', company: 'Example', description: 'Edición',
      startDate: '2025', endDate: '', current: true },
  ] }));
  assert.equal(response.status, 200);
});
