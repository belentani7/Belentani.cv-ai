import { cpSync, existsSync, mkdirSync } from 'node:fs';

if (!existsSync('.next/standalone')) {
  console.log('Standalone output not present; asset copy skipped');
  process.exit(0);
}

mkdirSync('.next/standalone/.next', { recursive: true });
cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
cpSync('public', '.next/standalone/public', { recursive: true });

console.log('Standalone assets copied');
