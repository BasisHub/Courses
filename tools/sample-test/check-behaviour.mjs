// Static coverage check for the behaviour tests. It opens no BBj session: `playwright test --list`
// loads the spec files but runs neither global setup nor any test.
//
//   node check-behaviour.mjs [--prefix <id prefix>] [--issues <comma list>|none]
//
// Fails (exit 1) when a manifest entry of kind window or dialog has no test titled `[<id>] ...`, or
// when an issue of an entry has no test titled `[<id>] issue #<n>: ...`. A behaviour plan checks only
// its own part: `--prefix dwc/04_ --issues 5,7`. Default: every entry, issues 3 to 7. Exit 2 when the
// test list cannot be read.
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { behaviourTitles, missingBehaviour, parseIssueList } from './lib/behaviour-check.js';
import { loadManifest } from './lib/manifest.js';
import { harnessDir } from './lib/paths.js';

function stop(message, code = 2) {
  console.error(`check-behaviour: ${message}`);
  process.exit(code);
}

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
    if (name !== '--prefix' && name !== '--issues') stop(`unknown argument ${argv[i]} (use --prefix, --issues)`);
    if (value === undefined) {
      i += 1;
      value = argv[i];
    }
    if (value === undefined || value === '') stop(`${name} needs a value`);
    args[name.slice(2)] = value;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
let issues;
try {
  issues = parseIssueList(args.issues);
} catch (error) {
  stop(error.message);
}

const cli = path.join(harnessDir, 'node_modules', '@playwright', 'test', 'cli.js');
const listed = spawnSync(process.execPath, [cli, 'test', '--list', '--project=samples', '--reporter=json'], {
  cwd: harnessDir,
  encoding: 'utf8',
  shell: false,
  windowsHide: true,
  maxBuffer: 64 * 1024 * 1024,
});
if (listed.error) stop(`cannot run Playwright: ${listed.error.message}`);

let report;
try {
  report = JSON.parse(listed.stdout);
} catch {
  const why = String(listed.stderr || listed.stdout || 'no output').split(/\r?\n/).find((line) => line.trim() !== '');
  stop(`cannot read the test list: ${why}`);
}
if (Array.isArray(report.errors) && report.errors.length > 0) {
  const first = String(report.errors[0].message ?? 'unknown error').split(/\r?\n/)[0];
  stop(`Playwright reported an error while listing tests: ${first}`);
}

const titles = behaviourTitles(report);
const missing = missingBehaviour(titles, loadManifest(), { prefix: args.prefix ?? '', issues });
for (const line of missing) console.log(line);
if (missing.length > 0) {
  console.log(`check-behaviour: ${missing.length} missing (${titles.length} behaviour tests found)`);
  process.exit(1);
}
console.log(`BEHAVIOUR-COVERAGE-OK ${titles.length}`);
