// debugLogMark and debugLogDelta against a temporary BBj home; no BBj, no browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { debugLogDelta, debugLogMark } from './run.js';

const SERIAL = 'BBX' + '123456';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'courses-run-test-'));
const home = path.join(tmp, 'bbx');
const log = path.join(home, 'log');
fs.mkdirSync(log, { recursive: true });
process.env.BBJ_HOME = home;
process.env.SAMPLE_TEST_RESULTS = path.join(tmp, 'results');
test.after(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
  delete process.env.BBJ_HOME;
  delete process.env.SAMPLE_TEST_RESULTS;
});

function write(name, text, mtime) {
  const file = path.join(log, name);
  fs.writeFileSync(file, text, 'utf8');
  fs.utimesSync(file, mtime, mtime);
  return file;
}

test('debugLogMark of a folder without Debug.log is null', () => {
  assert.equal(debugLogMark(), null);
  fs.writeFileSync(path.join(log, 'BBjServices.log.2026-01-02.0'), 'x');
  assert.equal(debugLogMark(), null);
});

test('debugLogMark picks the newest Debug.log file and records its size', () => {
  write('Debug.log.2026-01-01.0', 'old\n', new Date('2026-01-01T10:00:00Z'));
  const newer = write('Debug.log.2026-01-02.0', 'first line\n', new Date('2026-01-02T10:00:00Z'));
  const mark = debugLogMark();
  assert.equal(path.resolve(mark.file), path.resolve(newer));
  assert.equal(mark.size, Buffer.byteLength('first line\n'));
});

test('debugLogDelta counts the lines appended since the mark and the error lines among them', () => {
  const file = path.join(log, 'Debug.log.2026-01-02.0');
  const mark = debugLogMark();
  fs.appendFileSync(file, `all fine\nSomething ERROR happened ${SERIAL}\n\njava.lang.NullPointerException at x\n`);
  const delta = debugLogDelta(mark, { app: 'courses-test-app' });
  assert.deepEqual(delta, { file: 'Debug.log.2026-01-02.0', newLines: 3, errorLines: 2 });
  const kept = fs.readFileSync(path.join(tmp, 'results', 'debuglog', 'courses-test-app.txt'), 'utf8');
  assert.ok(kept.includes('Something ERROR happened <serial>'));
  assert.ok(kept.includes('NullPointerException'));
  assert.ok(!kept.includes(SERIAL));
  assert.ok(!kept.includes('all fine'));
});

test('debugLogDelta with nothing appended is empty and writes no file', () => {
  const mark = debugLogMark();
  const delta = debugLogDelta(mark, { app: 'courses-quiet-app' });
  assert.deepEqual(delta, { file: 'Debug.log.2026-01-02.0', newLines: 0, errorLines: 0 });
  assert.ok(!fs.existsSync(path.join(tmp, 'results', 'debuglog', 'courses-quiet-app.txt')));
});

test('debugLogDelta without a mark, or with a file that is gone, is empty', () => {
  assert.deepEqual(debugLogDelta(null), { file: null, newLines: 0, errorLines: 0 });
  assert.deepEqual(debugLogDelta({ file: path.join(log, 'Debug.log.gone'), size: 5 }), {
    file: 'Debug.log.gone',
    newLines: 0,
    errorLines: 0,
  });
});

test('debugLogDelta without an app name does not write a file', () => {
  const file = path.join(log, 'Debug.log.2026-01-02.0');
  const mark = debugLogMark();
  fs.appendFileSync(file, 'another error line\n');
  const delta = debugLogDelta(mark);
  assert.equal(delta.errorLines, 1);
  assert.ok(!fs.existsSync(path.join(tmp, 'results', 'debuglog', 'null.txt')));
});
