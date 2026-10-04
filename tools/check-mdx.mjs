// MDX compile check (CONV-01: every generated file compiles as MDX).
// Usage: node tools/check-mdx.mjs FILE...
// Exit codes: 0 all files compile, 1 any compile failure,
// 2 usage error or @mdx-js/mdx not found (run: cd docs && npm ci).
// Uses the same @mdx-js/mdx the docs build uses, resolved from docs/.
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node tools/check-mdx.mjs FILE...');
  process.exit(2);
}

let compile;
try {
  let target;
  try {
    const req = createRequire(path.join(root, 'docs', 'package.json'));
    target = pathToFileURL(req.resolve('@mdx-js/mdx')).href;
  } catch {
    target = pathToFileURL(
      path.join(root, 'docs', 'node_modules', '@mdx-js', 'mdx', 'index.js'),
    ).href;
  }
  ({compile} = await import(target));
} catch (e) {
  console.error('Cannot load @mdx-js/mdx from docs/: run cd docs && npm ci');
  process.exit(2);
}

function stripFrontMatter(text) {
  const lines = text.split('\n');
  if (lines[0] !== '---') return text;
  const end = lines.indexOf('---', 1);
  if (end === -1) return text;
  // Keep line numbers stable by blanking the front matter.
  return lines.map((l, i) => (i <= end ? '' : l)).join('\n');
}

let failed = false;
for (const file of files) {
  try {
    const text = stripFrontMatter(readFileSync(file, 'utf8'));
    await compile(text, {format: 'mdx'});
  } catch (e) {
    failed = true;
    const pos = e.line ? ` (${e.line}:${e.column})` : '';
    console.log(`FAIL ${file}: ${e.reason || e.message}${pos}`);
  }
}
process.exit(failed ? 1 : 0);
