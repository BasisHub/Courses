// npm run report: turns a results folder into tools/data/sample-test-report.md.
//
//   node report.mjs [--results <dir>] [--manifest <file>] [--notes <file>] [--out <file>]
//
// Defaults: results of the main checkout, manifest.json and report-notes.md next to this file,
// <repo>/tools/data/sample-test-report.md. The report is committed, so before it is written:
//   1. the repo root becomes <repo> and the home folder becomes ~ (BBj messages can carry paths),
//   2. checkReportText refuses the license serial pattern, the console header label, an em dash
//      and a leftover home folder,
//   3. the Java tool scans the temp file for the admin password (the value never enters Node);
//      any hit, or a scan that cannot run, deletes the temp file and refuses the report.
// Only after all three pass is the temp file renamed to the report.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { scanForSecrets } from './lib/admin.js';
import { ISSUES, loadManifest } from './lib/manifest.js';
import { harnessDir, mainCheckout, repoRoot, resultsDir, toPosix } from './lib/paths.js';
import { checkReportText, renderReport } from './lib/report.js';
import { replaceFile } from './lib/rename-retry.js';

class Refusal extends Error {}

const OPTIONS = new Set(['--results', '--manifest', '--notes', '--out']);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    let name = argv[i];
    let value;
    const eq = name.indexOf('=');
    if (name.startsWith('--') && eq !== -1) {
      value = name.slice(eq + 1);
      name = name.slice(0, eq);
    }
    if (!OPTIONS.has(name)) throw new Refusal(`unknown argument ${argv[i]} (use ${[...OPTIONS].join(', ')})`);
    if (value === undefined) {
      i += 1;
      value = argv[i];
    }
    if (!value) throw new Refusal(`${name} needs a value`);
    args[name.slice(2)] = value;
  }
  return args;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Refusal(`cannot read ${toPosix(file)}: ${error.message}`);
  }
}

// Every *.json in a folder, in file name order; a missing folder is an empty list.
function readFolder(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => readJson(path.join(dir, name)));
}

function readOptional(file) {
  return fs.existsSync(file) ? readJson(file) : null;
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Replaces a folder in its three spellings (forward slash, backslash, doubled backslash), ignoring case.
function replaceFolder(text, folder, replacement) {
  if (!folder) return text;
  const posix = toPosix(folder).replace(/\/+$/, '');
  const spellings = new Set([posix, posix.replace(/\//g, '\\'), posix.replace(/\//g, '\\\\')]);
  let out = text;
  for (const spelling of spellings) out = out.replace(new RegExp(escapeRegExp(spelling), 'gi'), () => replacement);
  return out;
}

// The repo root (and the main checkout, when the harness runs from a worktree) first, because
// they usually sit below the home folder.
function redactLocalPaths(text) {
  const roots = [...new Set([repoRoot, mainCheckout()])].sort((a, b) => b.length - a.length);
  let out = text;
  for (const root of roots) out = replaceFolder(out, root, '<repo>');
  return replaceFolder(out, os.homedir(), '~');
}

// Redacts every string inside a parsed JSON value. Done before rendering as well, because the
// renderer shortens long table cells: a path cut in the middle would no longer match its folder.
function redactValue(value) {
  if (typeof value === 'string') return redactLocalPaths(value);
  if (Array.isArray(value)) return value.map(redactValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactValue(item)]));
  }
  return value;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const results = path.resolve(args.results ?? resultsDir());
  const manifestFile = path.resolve(args.manifest ?? path.join(harnessDir, 'manifest.json'));
  const notesFile = path.resolve(args.notes ?? path.join(harnessDir, 'report-notes.md'));
  const out = path.resolve(args.out ?? path.join(repoRoot, 'tools', 'data', 'sample-test-report.md'));

  const compileFile = path.join(results, 'compile.json');
  if (!fs.existsSync(compileFile)) throw new Refusal('missing compile.json, run npm run compile');

  const manifest = loadManifest(manifestFile);
  const notes = fs.existsSync(notesFile) ? fs.readFileSync(notesFile, 'utf8') : '';
  let text;
  try {
    text = renderReport({
      manifest,
      issues: ISSUES,
      compile: redactValue(readJson(compileFile)),
      samples: redactValue(readFolder(path.join(results, 'samples'))),
      selftest: redactValue(readFolder(path.join(results, 'selftest'))),
      behaviour: redactValue(readFolder(path.join(results, 'behaviour'))),
      run: redactValue(readOptional(path.join(results, 'run.json'))),
      baseline: redactValue(readOptional(path.join(results, 'baseline.json'))),
      notes: redactLocalPaths(notes),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Refusal(error.message);
  }
  text = redactLocalPaths(text);

  const home = os.homedir();
  const problems = checkReportText(text, { forbidden: [toPosix(home), home] });
  if (problems.length > 0) throw new Refusal(`refused (${problems.join(', ')})`);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  const temp = `${out}.tmp`;
  fs.writeFileSync(temp, text, 'utf8');
  try {
    let scan;
    try {
      scan = await scanForSecrets(temp);
    } catch (error) {
      throw new Refusal(`refused (password scan failed: ${error.message})`);
    }
    if (scan !== 'CLEAN') throw new Refusal('refused (admin password found)');
    replaceFile(temp, out);
  } finally {
    fs.rmSync(temp, { force: true });
  }

  const relative = path.relative(repoRoot, out);
  const shown = relative.startsWith('..') || path.isAbsolute(relative) ? redactLocalPaths(toPosix(out)) : toPosix(relative);
  console.log(`report: ${shown} (${manifest.entries.length} rows)`);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Refusal ? `report: ${error.message}` : `report failed: ${error.message}`);
  process.exitCode = 1;
}
