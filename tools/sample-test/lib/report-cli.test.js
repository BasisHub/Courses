// Tests for report.mjs. The password scan runs the Java admin tool (a JDK and the BBj .lib folder,
// no running BBjServices), so these tests skip without them. The credentials are a fake env file;
// the serial number is built at runtime and never stored in a file.
import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { bbjHome, harnessDir, javaBin, repoRoot, toPosix } from './paths.js';

function skipReason() {
  if (!fs.existsSync(`${bbjHome()}/.lib/BBjAdminAPI.jar`)) return `no BBjAdminAPI.jar under ${bbjHome()}/.lib`;
  const probe = spawnSync(javaBin(), ['-version'], { shell: false, windowsHide: true });
  if (probe.status !== 0) return 'no runnable Java';
  return false;
}
const skip = skipReason();

const FAKE_PASSWORD = 'zq9-fake-password';
const SERIAL = 'BBX' + '123456';
const dataDir = path.join(import.meta.dirname, 'testdata', 'report');

let tmp;
let envFile;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'courses-report-cli-test-'));
  envFile = path.join(tmp, 'fake.env');
  fs.writeFileSync(envFile, `BBJ_ADMIN_USER=fakeuser\nBBJ_ADMIN_PASSWORD=${FAKE_PASSWORD}\n`);
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

function runReport(args) {
  return spawnSync(process.execPath, [path.join(harnessDir, 'report.mjs'), ...args], {
    env: { ...process.env, SAMPLE_TEST_ENV: envFile },
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
  });
}

function baseArgs(out, { results = dataDir, notes = path.join(dataDir, 'notes.md') } = {}) {
  return [
    '--results', results,
    '--manifest', path.join(dataDir, 'manifest.json'),
    '--notes', notes,
    '--out', out,
  ];
}

test('report.mjs writes the report for the synthetic results and leaves no temp file', { skip }, () => {
  const out = path.join(tmp, 'report.md');
  const res = runReport(baseArgs(out));
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /report: .*report\.md \(4 rows\)/);
  const text = fs.readFileSync(out, 'utf8');
  for (const heading of ['Summary', 'Results per sample', 'Issues #3 to #7', 'Findings per sample', 'Harness notes']) {
    assert.ok(text.includes(`## ${heading}`), heading);
  }
  assert.ok(!fs.existsSync(`${out}.tmp`));
});

test('report.mjs refuses a report that contains the admin password and writes nothing', { skip }, () => {
  const notes = path.join(tmp, 'notes.md');
  fs.writeFileSync(notes, `## Notes\n\nThe password is ${FAKE_PASSWORD}.\n`);
  const out = path.join(tmp, 'report.md');
  const res = runReport(baseArgs(out, { notes }));
  assert.equal(res.status, 1);
  assert.match(res.stderr, /report: refused \(admin password found\)/);
  assert.ok(!fs.existsSync(out));
  assert.ok(!fs.existsSync(`${out}.tmp`));
  assert.ok(!res.stdout.includes(FAKE_PASSWORD) && !res.stderr.includes(FAKE_PASSWORD));
});

test('report.mjs refuses a serial number before it writes anything', () => {
  const notes = path.join(tmp, 'notes.md');
  fs.writeFileSync(notes, `## Notes\n\nSerial ${SERIAL} appeared in a log.\n`);
  const out = path.join(tmp, 'report.md');
  const res = runReport(baseArgs(out, { notes }));
  assert.equal(res.status, 1);
  assert.match(res.stderr, /report: refused \(serial number pattern\)/);
  assert.ok(!fs.existsSync(out));
  assert.ok(!fs.existsSync(`${out}.tmp`));
});

test('report.mjs refuses a note section it does not know', () => {
  const notes = path.join(tmp, 'notes.md');
  fs.writeFileSync(notes, '## Surprise\n\nx\n');
  const out = path.join(tmp, 'report.md');
  const res = runReport(baseArgs(out, { notes }));
  assert.equal(res.status, 1);
  assert.match(res.stderr, /Surprise/);
  assert.ok(!fs.existsSync(out));
});

test('report.mjs needs compile.json', () => {
  const empty = path.join(tmp, 'empty-results');
  fs.mkdirSync(empty);
  const out = path.join(tmp, 'report.md');
  const res = runReport(baseArgs(out, { results: empty }));
  assert.equal(res.status, 1);
  assert.match(res.stderr, /report: missing compile\.json, run npm run compile/);
  assert.ok(!fs.existsSync(out));
});

test('report.mjs replaces the repo root and the home folder in results', { skip }, () => {
  const results = path.join(tmp, 'results');
  fs.cpSync(dataDir, results, { recursive: true });
  const file = path.join(results, 'samples', 'courses-dwc-01-dwc2.json');
  const sample = JSON.parse(fs.readFileSync(file, 'utf8'));
  const home = os.homedir();
  // The first reason is the one the results table shows, shortened to 160 characters (157 kept).
  // The padding puts the cut three characters before the end of the home folder name, so a
  // renderer that shortened the text before the redaction would leave most of the user name
  // behind. The other reasons cover the repo root and both spellings of the home folder.
  const cut = home.length - 3;
  const padding = 'x'.repeat(156 - cut);
  sample.reasons = [
    { category: 'start', detail: `${padding} ${home}\\long.css` },
    { category: 'bbj', detail: `!ERROR=12 Missing file ${toPosix(repoRoot)}/docs/examples/x.bbj` },
    { category: 'page', detail: `${toPosix(home)}/other/y.css` },
    { category: 'start', detail: `${home}\\other\\z.css` },
  ];
  sample.bbjErrors = [];
  sample.pageErrors = [];
  fs.writeFileSync(file, JSON.stringify(sample));
  const out = path.join(tmp, 'report.md');
  const res = runReport(baseArgs(out, { results }));
  assert.equal(res.status, 0, res.stderr);
  const text = fs.readFileSync(out, 'utf8').toLowerCase();
  assert.ok(!text.includes(toPosix(home).toLowerCase()), 'home folder still in the report');
  assert.ok(!text.includes(home.toLowerCase()), 'home folder (native form) still in the report');
  const partial = home.slice(0, cut).toLowerCase();
  assert.ok(!text.includes(partial), 'most of the home folder name is left in the report');
  assert.ok(text.includes(`${padding} ~`.slice(0, 40)), 'the long entry is missing from the report');
  assert.ok(text.includes('<repo>/docs/examples/x.bbj'), 'repo root not replaced');
});
