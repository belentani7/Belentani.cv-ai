import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('chat history remains within the API byte and message limits without mutating stored messages', () => {
  const file = new URL('../src/lib/chat-history.ts', import.meta.url);
  assert.ok(fs.existsSync(file), 'A shared bounded history builder is required');
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInThisContext(`(function(exports){${outputText}\n})`)(exports);
  const stored = Array.from({ length: 20 }, () => ({ role: 'assistant', content: '漢'.repeat(12000) }));
  stored.push({ role: 'user', content: 'Nueva pregunta' });
  const history = exports.buildChatHistory(stored);
  assert.ok(history.length <= 10);
  assert.ok(new TextEncoder().encode(JSON.stringify(history)).length <= 48000);
  assert.ok(history.every(message => message.content.length <= 8000));
  assert.equal(history.at(-1).content, 'Nueva pregunta');
  assert.equal(stored[0].content.length, 12000);
});
