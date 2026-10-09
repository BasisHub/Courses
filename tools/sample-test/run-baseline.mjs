// npm run baseline: the whole baseline in one command.
//
//   node run-baseline.mjs                 full run: results are emptied first, completeness is checked
//   node run-baseline.mjs --grep <regex>  subset run: only the matching sample tests, results are kept,
//                                         the report goes to results/report-preview.md
//
// Steps: compile pass, unit and coverage tests, self-test, sample tests (smoke and behaviour), the
// completeness check, the harness-issue check, the leftover check, the report. The sample tests are
// expected to contain red results: those are findings, and their exit code is ignored. The exit code of
// this script is non-zero only for a harness failure (a step that did not do its job, see
// lib/baseline.js). Everything is spawned as `node <script>` or `node <playwright cli>` with an
// argument array and `shell: false` (Windows cannot spawn the npm launcher scripts without a shell).
//
// The script holds the BBj run lock (3 BBJ licenses) for the whole run, 60 to 90 minutes. Its
// heartbeat keeps the lock fresh; the children find the lock through COURSES_LOCK_TOKEN and reuse it.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { isHarnessSession, listApps, readRunSnapshot, status, takeRunSnapshot } from './lib/admin.js';
import { sampleApps } from './lib/apps.js';
import { completenessFailures, harnessIssueFailures, samplesRunFailures, summarize } from './lib/baseline.js';
import { redact } from './lib/console.js';
import { acquireLock, releaseLock } from './lib/lock.js';
import { listExampleFiles, loadManifest } from './lib/manifest.js';
import { examplesDir, harnessDir, resultsDir } from './lib/paths.js';
import { readResults } from './lib/results.js';
import { makeBaseline } from './lib/schema.js';

const cli = path.join(harnessDir, 'node_modules', '@playwright', 'test', 'cli.js');
const RESET_FOLDERS = ['samples', 'behaviour', 'selftest', 'selftest-behaviour', 'screenshots', 'console', 'debuglog', 'probe'];

function usage(message) {
  console.error(`baseline: ${message}`);
  console.error('usage: node run-baseline.mjs [--grep <regex>]');
  process.exit(2);
}

function parseArgs(argv) {
  const args = { grep: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--grep') {
      i += 1;
      if (!argv[i]) usage('--grep needs a regular expression');
      args.grep = argv[i];
    } else if (arg.startsWith('--grep=')) {
      args.grep = arg.slice('--grep='.length);
      if (!args.grep) usage('--grep needs a regular expression');
    } else {
      usage(`unknown argument ${arg}`);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const subset = args.grep !== null;

/** Runs `node <args>` in the harness folder with the output shown; resolves to the exit code (null when it could not run). */
function runNode(label, nodeArgs, { env = {} } = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, nodeArgs, {
      cwd: harnessDir,
      stdio: 'inherit',
      shell: false,
      windowsHide: true,
      env: { ...process.env, ...env },
    });
    child.on('error', (error) => {
      console.error(`baseline: ${label} could not start: ${error.message}`);
      resolve(null);
    });
    child.on('close', (code) => resolve(code));
  });
}

function readJsonOrNull(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function readFolder(name) {
  try {
    return readResults(name);
  } catch (error) {
    harnessFailures.push(`results/${name} cannot be read: ${error.message}`);
    return [];
  }
}

const harnessFailures = [];
const codes = { selftest: null, samples: null };
// Taken once the run lock is held: results of a run that finished while this one waited are not fresh.
let startedAt = new Date().toISOString();
let lockHeld = false;

function writeBaseline() {
  const run = readJsonOrNull(resultsDir('run.json'));
  let known = null;
  try {
    known = readResults('selftest').find((r) => String(r.app ?? r.id ?? '').includes('known-print')) ?? null;
  } catch {
    // no self-test results (the self-test did not run): the BBj version stays unknown
  }
  const baseline = makeBaseline({
    startedAt,
    finishedAt: new Date().toISOString(),
    playwright: { ...codes },
    harnessFailures,
    versions: { playwright: run?.playwright ?? null, chromium: run?.chromium ?? null, bbj: known?.bbjVersion ?? null },
  });
  fs.writeFileSync(resultsDir('baseline.json'), redact(`${JSON.stringify(baseline, null, 2)}\n`), 'utf8');
}

function printSummary() {
  const samples = readFolder('samples').filter((r) => Date.parse(r.startedAt) >= Date.parse(startedAt));
  const behaviour = readFolder('behaviour').filter((r) => Date.parse(r.startedAt) >= Date.parse(startedAt));
  const summary = summarize({ samples, behaviour });
  const s = summary.smoke;
  console.log(`baseline: smoke ${s.total} results: ${s.pass} pass, ${s.fail} fail, ${s.blocked} blocked`);
  const categories = Object.entries(summary.smokeCategories).map(([name, n]) => `${name} ${n}`);
  if (categories.length > 0) console.log(`baseline: smoke reasons by category: ${categories.join(', ')}`);
  const b = summary.behaviour;
  console.log(`baseline: behaviour ${b.total} results: ${b.pass} pass, ${b.fail} fail, ${b.blocked} blocked`);
  if (harnessFailures.length === 0) {
    console.log('baseline: harness failures: none');
  } else {
    console.log(`baseline: harness failures: ${harnessFailures.length}`);
    for (const failure of harnessFailures) console.log(`  - ${failure}`);
  }
}

async function main() {
  const lock = await acquireLock({ owner: 'baseline' });
  lockHeld = true;
  startedAt = new Date().toISOString();
  process.env.COURSES_LOCK_TOKEN = lock.token;
  try {
    // W9: remember the BBj sessions that exist before the run, so only the run's own `<initializing>`
    // sessions can be swept.
    if (!lock.reentrant) await takeRunSnapshot(lock.token);

    // An old baseline.json must not pass for the result of a run that dies half way.
    fs.rmSync(resultsDir('baseline.json'), { force: true });
    if (!subset) {
      for (const name of RESET_FOLDERS) {
        const folder = resultsDir(name);
        fs.rmSync(folder, { recursive: true, force: true });
        fs.mkdirSync(folder, { recursive: true });
      }
    }
    console.log(`baseline: ${subset ? `subset run (--grep ${args.grep})` : 'full run'} started ${startedAt}`);

    // a. compile pass
    console.log('baseline: step 1 of 7, compile pass');
    const compileCode = await runNode('compile', ['compile.mjs']);
    const compiled = readJsonOrNull(resultsDir('compile.json'));
    const expectedFiles = listExampleFiles(examplesDir).length;
    if (compileCode !== 0 || !compiled || !Array.isArray(compiled.files) || compiled.files.length !== expectedFiles) {
      harnessFailures.push('compile pass incomplete');
    }

    // b. unit and coverage tests (no BBj run lock needed: they use their own temporary lock files)
    console.log('baseline: step 2 of 7, unit and coverage tests');
    const unitEnv = { COURSES_LOCK_TOKEN: '' };
    const unitCode = await runNode('unit tests', ['--test', 'lib/*.test.js', 'tests/*.test.js'], { env: unitEnv });
    if (unitCode !== 0) harnessFailures.push('unit or coverage tests failed');

    // c. self-test: the four controls and the wrappers
    console.log('baseline: step 3 of 7, self-test');
    codes.selftest = await runNode('self-test', [cli, 'test', '--project=selftest']);
    if (codes.selftest !== 0) harnessFailures.push('self-test failed');

    if (harnessFailures.length > 0) {
      console.log('baseline: a harness step failed, the sample tests and the report are skipped');
      writeBaseline();
      return;
    }

    // d. sample tests; the exit code only says whether samples were red
    console.log('baseline: step 4 of 7, sample tests (smoke and behaviour)');
    const jsonFile = path.join(resultsDir(), 'playwright-samples.json');
    fs.rmSync(jsonFile, { force: true });
    const samplesArgs = [cli, 'test', '--project=samples', '--reporter=list,json'];
    if (subset) samplesArgs.push('--grep', args.grep);
    codes.samples = await runNode('sample tests', samplesArgs, { env: { PLAYWRIGHT_JSON_OUTPUT_NAME: jsonFile } });
    harnessFailures.push(...samplesRunFailures(readJsonOrNull(jsonFile)));

    // e. completeness
    console.log('baseline: step 5 of 7, completeness and harness issues');
    const manifest = loadManifest();
    if (subset) {
      console.log('completeness: skipped (subset run)');
    } else {
      harnessFailures.push(
        ...completenessFailures({
          apps: sampleApps(manifest),
          manifest,
          samples: readFolder('samples'),
          behaviour: readFolder('behaviour'),
          startedAt,
        }),
      );
    }

    // e2. harness issues: license-leak, wrapper-error, blocked by license (also in a subset run)
    harnessFailures.push(
      ...harnessIssueFailures(
        {
          samples: readFolder('samples'),
          selftest: readFolder('selftest'),
          behaviour: readFolder('behaviour'),
          selftestBehaviour: readFolder('selftest-behaviour'),
        },
        startedAt,
      ),
    );

    // f. leftovers
    console.log('baseline: step 6 of 7, leftover check');
    try {
      const known = readRunSnapshot(lock.token);
      const apps = await listApps('courses-');
      const { processes } = await status();
      const sessions = processes.filter((p) => isHarnessSession(p, { knownIds: known }));
      if (apps.length > 0 || sessions.length > 0) {
        const what = [...apps.map((a) => a.name), ...sessions.map((p) => `session ${p.id}`)].join(', ');
        harnessFailures.push(`leftover apps or sessions: ${what}`);
        await runNode('cleanup', ['cleanup.mjs']);
      }
    } catch (error) {
      harnessFailures.push(`leftover check failed: ${error.message}`);
    }

    // g. report. baseline.json is written first so that the report shows this run's harness failures.
    console.log('baseline: step 7 of 7, report');
    writeBaseline();
    const reportArgs = ['report.mjs'];
    if (subset) reportArgs.push('--out', path.join(resultsDir(), 'report-preview.md'));
    const reportCode = await runNode('report', reportArgs);
    if (reportCode !== 0) {
      harnessFailures.push('report refused or failed');
      writeBaseline();
    }
  } finally {
    if (!lock.reentrant) releaseLock(lock.token);
  }
}

try {
  await main();
} catch (error) {
  harnessFailures.push(`baseline stopped: ${error.message}`);
  // Without the lock another run may be writing results: leave the folder alone.
  if (lockHeld) {
    try {
      writeBaseline();
    } catch {
      // the results folder is not writable: the failure is printed below
    }
  }
}
printSummary();
process.exitCode = harnessFailures.length > 0 ? 1 : 0;
