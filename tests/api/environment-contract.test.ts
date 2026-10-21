import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('AI server environment contract', () => {
  const template = readFileSync(resolve(process.cwd(), '.env.example'), 'utf8');
  const vars = new Set(
    [...template.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((match) => match[1]),
  );
  const routes = [
    readFileSync(resolve(process.cwd(), 'src/app/api/cv/generate/route.ts'), 'utf8'),
    readFileSync(resolve(process.cwd(), 'src/app/api/cover-letter/route.ts'), 'utf8'),
  ];

  it.each(['KV_REST_API_URL', 'KV_REST_API_TOKEN'])(
    'documents %s, which both protected endpoints require',
    (key) => {
      expect(vars.has(key)).toBe(true);
      for (const route of routes) {
        expect(route).toContain(`process.env.${key}`);
      }
    },
  );

  it('does not accidentally publish secret values in the template', () => {
    for (const line of template.split(/\r?\n/)) {
      const assignment = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
      if (!assignment) continue;
      expect(assignment[2].trim()).toBe('');
    }
  });
});
