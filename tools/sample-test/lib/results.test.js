// Result files go to SAMPLE_TEST_RESULTS, here a temporary folder; nothing touches the real results.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  markHarnessIssue,
  readResults,
  writeBehaviourResult,
  writeConsoleRaw,
  writeSampleResult,
} from './results.js';

// Built at runtime so that no file in the repository holds a literal serial number.
const SERIAL = 'BBX' + '123456';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'courses-results-test-'));
process.env.SAMPLE_TEST_RESULTS = tmp;
test.after(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
  delete process.env.SAMPLE_TEST_RESULTS;
});

test('writeSampleResult writes results/samples/<app>.json and returns the path', () => {
  const file = writeSampleResult({ app: 'courses-fixture-known-good', status: 'pass' });
  assert.equal(file, path.join(tmp, 'samples', 'courses-fixture-known-good.json'));
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { app: 'courses-fixture-known-good', status: 'pass' });
  assert.ok(fs.readFileSync(file, 'utf8').endsWith('\n'));
});

test('writeSampleResult honours dir and redacts a serial number', () => {
  const file = writeSampleResult({ app: 'x-app', note: `see ${SERIAL} here` }, { dir: 'selftest' });
  assert.equal(file, path.join(tmp, 'selftest', 'x-app.json'));
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(!text.includes(SERIAL));
  assert.ok(text.includes('<serial>'));
});

test('writeSampleResult cleans the app name so it cannot leave the folder', () => {
  const file = writeSampleResult({ app: '../../evil name', status: 'fail' });
  assert.equal(path.dirname(file), path.join(tmp, 'samples'));
  assert.equal(path.basename(file), 'evil-name.json');
  assert.throws(() => writeSampleResult({ status: 'fail' }), /app name/);
});

test('writeBehaviourResult names the file app--test and cuts the test part to 60 characters', () => {
  const file = writeBehaviourResult({ app: 'courses-dwc-01-dwc2', test: 'Issue 3: Say Hello shows a message box', outcome: 'pass' });
  assert.equal(path.join(tmp, 'behaviour', 'courses-dwc-01-dwc2--issue-3-say-hello-shows-a-message-box.json'), file);
  const long = writeBehaviourResult({ app: 'a', test: 'x'.repeat(100), outcome: 'pass' });
  assert.equal(path.basename(long), `a--${'x'.repeat(60)}.json`);
});

test('writeBehaviourResult honours dir, so the self-test results stay apart from the sample ones', () => {
  const file = writeBehaviourResult({ app: 'courses-fixture-known-good', test: 'wrapper records a pass', outcome: 'pass' }, { dir: 'selftest-behaviour' });
  assert.equal(file, path.join(tmp, 'selftest-behaviour', 'courses-fixture-known-good--wrapper-records-a-pass.json'));
  assert.deepEqual(readResults('selftest-behaviour').map((r) => r.outcome), ['pass']);
});

test('writeConsoleRaw writes the lines as they are, under results/console', () => {
  const file = writeConsoleRaw({ name: 'courses-fixture-known-print' }, ['BBj WebCUI Console', `Serial ${SERIAL}`, 'line']);
  assert.equal(file, path.join(tmp, 'console', 'courses-fixture-known-print.txt'));
  assert.equal(fs.readFileSync(file, 'utf8'), `BBj WebCUI Console\nSerial ${SERIAL}\nline\n`);
  assert.equal(writeConsoleRaw('plain-name', []), path.join(tmp, 'console', 'plain-name.txt'));
});

test('readResults returns the parsed files in name order and [] for an empty folder', () => {
  writeSampleResult({ app: 'b-app', n: 2 }, { dir: 'order' });
  writeSampleResult({ app: 'a-app', n: 1 }, { dir: 'order' });
  fs.writeFileSync(path.join(tmp, 'order', 'notes.txt'), 'ignored');
  assert.deepEqual(readResults('order').map((r) => r.n), [1, 2]);
  assert.deepEqual(readResults('nothing-here'), []);
});

test('markHarnessIssue patches every readable file and skips the others', () => {
  const a = writeSampleResult({ app: 'leak-a', status: 'pass', harnessIssue: null, leaked: [] }, { dir: 'leak' });
  const b = writeBehaviourResult({ app: 'leak-b', test: 't', outcome: 'pass', harnessIssue: null });
  const missing = path.join(tmp, 'leak', 'missing.json');
  const patched = markHarnessIssue([a, b, missing], 'license-leak', { leaked: [{ id: '7', program: 'p.bbj' }] });
  assert.deepEqual(patched, [a, b]);
  const ra = JSON.parse(fs.readFileSync(a, 'utf8'));
  assert.equal(ra.harnessIssue, 'license-leak');
  assert.deepEqual(ra.leaked, [{ id: '7', program: 'p.bbj' }]);
  assert.equal(ra.status, 'pass');
  assert.equal(JSON.parse(fs.readFileSync(b, 'utf8')).harnessIssue, 'license-leak');
});
