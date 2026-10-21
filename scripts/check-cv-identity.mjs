import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('root is Belentani CV Studio, not another project', () => {
  const home = file('src/app/page.tsx');
  assert.match(home, /CVStudioPage/);
  assert.doesNotMatch(home, /ManosAbiertasApp/);
  assert.match(file('src/app/cv/page.tsx'), /CVSection/);
});

test('Manos Abiertas features remain reachable on a dedicated path', () => {
  const educationRoute = file('src/app/manos-abiertas/page.tsx');
  assert.match(educationRoute, /ManosAbiertasApp/);
});

test('root SEO and PWA identify the actual product', () => {
  const layout = file('src/app/layout.tsx');
  const manifest = JSON.parse(file('public/manifest.json'));
  assert.match(layout, /Belentani \| CV Studio/);
  assert.doesNotMatch(layout, /manos-abiertas\.es/);
  assert.equal(manifest.short_name, 'Belentani CV');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.theme_color, '#08090b');
});
