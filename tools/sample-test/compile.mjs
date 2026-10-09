// npm run compile: runs every .bbj under docs/examples through the local BBj compiler twice and
// records the result per file in results/compile.json (SAMP-02). Needs the compiler only, no
// BBjServices.
//
//   node compile.mjs               compile docs/examples
//   node compile.mjs --fixtures    also compile tools/sample-test/fixtures/*.bbj into `fixtures`
//
// Pass 1 (syntax):     BBjCpl.exe -N -X <file>
// Pass 2 (type check): BBjCpl.exe -t -N -X -W -c<BBJ_HOME>/cfg/config.bbx <file>
// Both passes run inside the file's folder so `use ::Car.bbj::Car` resolves. `-N` writes no output
// file; after the run the script checks that no file under the compiled folders changed (D-03).
// The compiler always exits 0, so the text it prints is the result (see lib/compile.js).
//
// Findings are data, not harness failures: the script exits 0 unless the compiler cannot run
// (exit 2) or a compiled folder changed (exit 2).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { parseCompileOutput, summarizeTypecheck } from './lib/compile.js';
import { bbjHome, examplesDir, fixturesDir, resultsDir, toPosix } from './lib/paths.js';
import { makeCompileResult } from './lib/schema.js';

const TIMEOUT_MS = 60000;
const withFixtures = process.argv.includes('--fixtures');
const exe = `${bbjHome()}/bin/BBjCpl.exe`;
const config = `${bbjHome()}/cfg/config.bbx`;

function stop(message) {
  console.error(message);
  process.exit(2);
}

/** Every .bbj below dir, POSIX paths relative to dir, sorted. */
function listBbj(dir) {
  return fs
    .readdirSync(dir, { recursive: true })
    .map((p) => toPosix(p))
    .filter((p) => p.toLowerCase().endsWith('.bbj'))
    .sort();
}

/** Output of one compiler run (stdout and stderr together). A spawn error or timeout stops the run. */
function runCompiler(args, cwd) {
  const r = spawnSync(exe, args, {
    cwd,
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
    timeout: TIMEOUT_MS,
  });
  if (r.error || r.status === null) {
    const why = r.error ? r.error.message : `ended by signal ${r.signal}`;
    stop(`compile: cannot run the compiler ${exe} in ${toPosix(cwd)}: ${why}`);
  }
  return [r.stdout, r.stderr].filter((s) => s).join('\n');
}

/** @returns {{ entry: object, unparsed: string[] }} */
function compileFile(id, absolute) {
  const cwd = path.dirname(absolute);
  const name = path.basename(absolute);

  const syntaxText = runCompiler(['-N', '-X', name], cwd);
  const syntax = {
    ok: syntaxText.trim() === '',
    messages: syntaxText.split(/\r?\n/).filter((line) => line.trim() !== ''),
  };

  const typecheckText = runCompiler(['-t', '-N', '-X', '-W', `-c${config}`, name], cwd);
  const { records, other } = parseCompileOutput(typecheckText);
  return { entry: { id, syntax, typecheck: summarizeTypecheck(records) }, unparsed: other };
}

/** path -> "size:mtime" for every file below dir. */
function snapshot(dir) {
  const files = new Map();
  for (const rel of fs.readdirSync(dir, { recursive: true })) {
    const stat = fs.statSync(path.join(dir, rel));
    if (stat.isFile()) files.set(toPosix(rel), `${stat.size}:${stat.mtimeMs}`);
  }
  return files;
}

function changedFiles(before, after) {
  const names = new Set([...before.keys(), ...after.keys()]);
  return [...names].filter((n) => before.get(n) !== after.get(n)).sort();
}

function compileAll(dir, idOf) {
  const entries = [];
  const notes = [];
  for (const rel of listBbj(dir)) {
    const id = idOf(rel);
    const { entry, unparsed } = compileFile(id, path.join(dir, rel));
    entries.push(entry);
    for (const line of unparsed) notes.push(`NOTE ${id}: unparsed compiler output: ${line}`);
  }
  return { entries, notes };
}

function printSummary(label, entries) {
  const syntaxBad = entries.filter((e) => !e.syntax.ok);
  const withFindings = entries.filter((e) => e.typecheck.findings.length > 0);
  const findingCount = entries.reduce((n, e) => n + e.typecheck.findings.length, 0);
  const undeclared = entries.reduce((n, e) => n + e.typecheck.undeclared, 0);
  console.log(
    `${label}: ${entries.length} files, syntax errors in ${syntaxBad.length} files, ` +
      `type-check findings ${findingCount} in ${withFindings.length} files, undeclared follow-ups ${undeclared}`,
  );
  for (const e of syntaxBad) {
    for (const message of e.syntax.messages) console.log(`${e.id}: syntax ${message}`);
  }
  for (const e of withFindings) {
    for (const f of e.typecheck.findings) console.log(`${e.id}:${f.line} ${f.message}`);
  }
}

const watched = [examplesDir, ...(withFixtures ? [fixturesDir] : [])];
const before = new Map(watched.map((dir) => [dir, snapshot(dir)]));

const examples = compileAll(examplesDir, (rel) => rel);
const fixtures = withFixtures ? compileAll(fixturesDir, (rel) => `fixture/${rel}`) : null;

const result = makeCompileResult({
  compiler: toPosix(exe),
  generatedAt: new Date().toISOString(),
  files: examples.entries,
});
if (fixtures) result.fixtures = fixtures.entries;
const outFile = path.join(resultsDir(), 'compile.json');
fs.writeFileSync(outFile, `${JSON.stringify(result, null, 2)}\n`);

printSummary('compile', examples.entries);
if (fixtures) printSummary('fixtures', fixtures.entries);
for (const note of [...examples.notes, ...(fixtures ? fixtures.notes : [])]) console.log(note);
console.log(`wrote ${toPosix(outFile)}`);

// D-03: the compile pass must not leave anything behind in the folders it compiled.
let touched = [];
for (const dir of watched) {
  touched = touched.concat(changedFiles(before.get(dir), snapshot(dir)).map((n) => `${toPosix(dir)}/${n}`));
}
if (touched.length > 0) {
  stop(`compile: the compiler changed files that it must not touch:\n${touched.join('\n')}`);
}
