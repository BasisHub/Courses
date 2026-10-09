import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  parseStatus,
  parseRegister,
  parseApps,
  isHarnessSession,
  newHarnessSessions,
  readRunSnapshot,
  runSnapshotPath,
} from './admin.js';
import { allApps } from './apps.js';

const KEYS = ['COURSES_RUN_SNAPSHOT', 'COURSES_LOCK_FILE', 'COURSES_LOCK_TOKEN'];
let tmp;
let saved;

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'courses-admin-test-'));
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  fs.rmSync(tmp, { recursive: true, force: true });
});

const ROOTS = ['c:/r'];

test('parseStatus reads license counts and keeps the whole program path (since contains spaces)', () => {
  const out = parseStatus([
    'LICENSE BBJ total=3 inUse=1',
    'LICENSE WEBCUI total=2 inUse=0',
    'PROC id=12 since=Thu Oct 08 13:00:00 CEST 2026 notResponding=0 prog=C:\\Users\\x\\Courses\\docs\\examples\\dwc\\01_GUI2BUI2DWC\\DWC2.bbj',
    'Note: Some input files use unchecked or unsafe operations.',
  ]);
  assert.deepEqual(out.licenses.BBJ, { total: 3, inUse: 1 });
  assert.deepEqual(out.licenses.WEBCUI, { total: 2, inUse: 0 });
  assert.equal(out.processes.length, 1);
  assert.equal(out.processes[0].id, '12');
  assert.equal(out.processes[0].since, 'Thu Oct 08 13:00:00 CEST 2026');
  assert.equal(out.processes[0].notResponding, '0');
  assert.equal(
    out.processes[0].program,
    'C:\\Users\\x\\Courses\\docs\\examples\\dwc\\01_GUI2BUI2DWC\\DWC2.bbj',
  );
});

test('parseStatus handles an empty program name and CRLF leftovers', () => {
  const out = parseStatus(['PROC id=5 since=now notResponding=3 prog=\r', 'LICENSE BBJ total=3 inUse=0\r']);
  assert.equal(out.processes[0].program, '');
  assert.equal(out.licenses.BBJ.total, 3);
});

test('parseRegister splits URL and FAIL records; parseApps reads APP records', () => {
  const r = parseRegister([
    'URL courses-a http://h:8888/webapp/courses-a',
    'FAIL courses-b no such program: C:/x.bbj',
    'unrelated JVM note',
  ]);
  assert.deepEqual(r.urls, { 'courses-a': 'http://h:8888/webapp/courses-a' });
  assert.deepEqual(r.failures, [{ name: 'courses-b', reason: 'no such program: C:/x.bbj' }]);
  assert.deepEqual(parseApps(['APP courses-a C:/r/a.bbj', 'APP courses-b C:/r/with space/b.bbj', 'junk']), [
    { name: 'courses-a', program: 'C:/r/a.bbj' },
    { name: 'courses-b', program: 'C:/r/with space/b.bbj' },
  ]);
});

test('isHarnessSession: anchored prefix match for examples and fixtures, any slash style and letter case', () => {
  const is = (program, opts = {}) => isHarnessSession({ id: '9', program }, { roots: ROOTS, ...opts });
  assert.equal(is('C:\\R\\docs\\examples\\dwc\\a.bbj'), true);
  assert.equal(is('c:/r/tools/sample-test/fixtures/known-good.bbj'), true);
});

test('isHarnessSession: refuses other checkouts, unanchored paths, BBj demos and empty programs', () => {
  const is = (program, opts = {}) => isHarnessSession({ id: '9', program }, { roots: ROOTS, ...opts });
  assert.equal(is('C:/other/docs/examples/a.bbj'), false);
  assert.equal(is('C:/r/x/docs/examples/a.bbj'), false);
  assert.equal(is('C:/rr/docs/examples/a.bbj'), false);
  assert.equal(is('C:/r/docs/examples'), false);
  assert.equal(is('C:/r/docs/examples/../../secret/a.bbj'), false);
  assert.equal(is('C:/bbx/demos/x.bbj'), false);
  assert.equal(is(''), false);
  assert.equal(isHarnessSession({ id: '9' }, { roots: ROOTS }), false);
});

test('isHarnessSession: the program name format seen live (forward slashes, drive letter, mixed case) matches every registered path', () => {
  // Observed 2026-10-09 on BBjServices 26.03: the Admin API reports the registered program path
  // unchanged, for example C:/Users/<user>/<checkout>/tools/sample-test/fixtures/known-good.bbj.
  for (const app of allApps()) {
    assert.equal(isHarnessSession({ id: '9', program: app.program }), true, app.id);
  }
  assert.equal(isHarnessSession({ id: '9', program: 'C:/bbx/demos/chiledit/chiledit.bbj' }), false);
});

test('isHarnessSession: <initializing> counts only when its id is new since the run snapshot', () => {
  const init = { id: '7', program: '<initializing>' };
  assert.equal(isHarnessSession(init, { roots: ROOTS }), false);
  assert.equal(isHarnessSession(init, { roots: ROOTS, knownIds: new Set(['1']) }), true);
  assert.equal(isHarnessSession(init, { roots: ROOTS, knownIds: ['1'] }), true);
  assert.equal(isHarnessSession(init, { roots: ROOTS, knownIds: new Set(['7']) }), false);
});

test('newHarnessSessions returns only new harness or new initializing sessions', () => {
  const found = newHarnessSessions(
    new Set(['1']),
    [
      { id: '1', program: 'C:/r/docs/examples/a.bbj' },
      { id: '2', program: 'C:/r/docs/examples/b.bbj' },
      { id: '3', program: 'C:/bbx/demos/x.bbj' },
      { id: '4', program: '<initializing>' },
    ],
    { roots: ROOTS },
  );
  assert.deepEqual(found.map((p) => p.id), ['2', '4']);
});

test('readRunSnapshot returns the id set for a matching token only; a missing or broken file gives null', () => {
  const file = path.join(tmp, 'snap.json');
  process.env.COURSES_RUN_SNAPSHOT = file;
  assert.equal(runSnapshotPath(), file);
  assert.equal(readRunSnapshot('t1'), null);
  fs.writeFileSync(file, JSON.stringify({ token: 't1', ids: ['5'], takenAt: 'x' }));
  const ids = readRunSnapshot('t1');
  assert.ok(ids instanceof Set);
  assert.ok(ids.has('5'));
  assert.equal(readRunSnapshot('t2'), null);
  process.env.COURSES_LOCK_TOKEN = 't1';
  assert.ok(readRunSnapshot().has('5'));
  fs.writeFileSync(file, '{not json');
  assert.equal(readRunSnapshot('t1'), null);
});

test('runSnapshotPath defaults to the lock path plus .procs.json', () => {
  process.env.COURSES_LOCK_FILE = path.join(tmp, 'x.lock');
  assert.equal(runSnapshotPath(), path.join(tmp, 'x.lock') + '.procs.json');
});
