import test, { beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { acquireLock, releaseLock, lockPath, STALE_MS } from './lock.js';

const KEYS = [
  'COURSES_LOCK_FILE',
  'COURSES_LOCK_WAIT_MS',
  'COURSES_LOCK_TOKEN',
  'COURSES_RUN_SNAPSHOT',
  'COURSES_LOCK_HEARTBEAT_MS',
];
let tmp;
let saved;
let held;

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'courses-lock-test-'));
  process.env.COURSES_LOCK_FILE = path.join(tmp, 'test.lock');
  held = [];
});

afterEach(() => {
  mock.restoreAll();
  for (const token of held) releaseLock(token);
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  fs.rmSync(tmp, { recursive: true, force: true });
});

async function take(opts) {
  const lock = await acquireLock(opts);
  if (!lock.reentrant) held.push(lock.token);
  return lock;
}

function deadPid() {
  return spawnSync(process.execPath, ['-e', ''], { shell: false, windowsHide: true }).pid;
}

function writeLock({ pid, token = 'old-token', owner = 'old', ageMs = 0 }) {
  const file = lockPath();
  fs.writeFileSync(file, JSON.stringify({ token, pid, owner, startedAt: new Date().toISOString() }));
  if (ageMs) {
    const when = new Date(Date.now() - ageMs);
    fs.utimesSync(file, when, when);
  }
  return file;
}

function readLock() {
  return JSON.parse(fs.readFileSync(lockPath(), 'utf8'));
}

const HOUR = 60 * 60 * 1000;

test('lockPath honors COURSES_LOCK_FILE and defaults to the OS temp folder; STALE_MS is 4 hours', () => {
  assert.equal(lockPath(), path.join(tmp, 'test.lock'));
  delete process.env.COURSES_LOCK_FILE;
  assert.equal(lockPath(), path.join(os.tmpdir(), 'courses-sample-test-bbj.lock'));
  assert.equal(STALE_MS, 4 * HOUR);
});

test('acquire writes {token,pid,owner,startedAt}; a second acquire is refused; release removes the file', async () => {
  const lock = await take({ owner: 't' });
  assert.equal(lock.reentrant, false);
  const info = readLock();
  assert.deepEqual(Object.keys(info).sort(), ['owner', 'pid', 'startedAt', 'token']);
  assert.equal(info.token, lock.token);
  assert.equal(info.pid, process.pid);
  assert.equal(info.owner, 't');
  await assert.rejects(acquireLock({ owner: 'u', waitMs: 300, pollMs: 50 }), /held by pid/);
  releaseLock(lock.token);
  assert.equal(fs.existsSync(lockPath()), false);
});

test('release with a foreign token keeps the file; release of a missing file does not throw', async () => {
  const lock = await take({ owner: 't' });
  releaseLock('not-my-token');
  assert.equal(fs.existsSync(lockPath()), true);
  releaseLock(lock.token);
  assert.doesNotThrow(() => releaseLock(lock.token));
});

test('COURSES_LOCK_WAIT_MS sets the default wait time', async () => {
  await take({ owner: 't' });
  process.env.COURSES_LOCK_WAIT_MS = '300';
  const started = Date.now();
  await assert.rejects(acquireLock({ owner: 'u', pollMs: 50 }), /held by pid/);
  assert.ok(Date.now() - started < 2000, 'must give up well before 2 s');
});

test('a lock of an exited process is taken over and leaves no .stale- file behind', async () => {
  writeLock({ pid: deadPid() });
  const lock = await take({ owner: 'new', waitMs: 2000, pollMs: 50 });
  assert.equal(readLock().owner, 'new');
  assert.equal(readLock().token, lock.token);
  const leftovers = fs.readdirSync(tmp).filter((n) => n.startsWith('test.lock.stale-'));
  assert.deepEqual(leftovers, []);
});

test('a live pid with a lock mtime 5 hours old is stale; 3 hours old is not', async () => {
  writeLock({ pid: process.pid, token: 'foreign', ageMs: 5 * HOUR });
  const lock = await take({ owner: 'new', waitMs: 2000, pollMs: 50 });
  assert.equal(readLock().owner, 'new');
  releaseLock(lock.token);

  writeLock({ pid: process.pid, token: 'foreign', ageMs: 3 * HOUR });
  await assert.rejects(acquireLock({ owner: 'new', waitMs: 300, pollMs: 50 }), /held by pid/);
  assert.equal(readLock().token, 'foreign');
});

test('two acquirers racing for a dead-pid lock: exactly one wins', async () => {
  writeLock({ pid: deadPid() });
  const results = await Promise.allSettled([
    acquireLock({ owner: 'a', waitMs: 300, pollMs: 50 }),
    acquireLock({ owner: 'b', waitMs: 300, pollMs: 50 }),
  ]);
  for (const r of results) if (r.status === 'fulfilled') held.push(r.value.token);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.filter((r) => r.status === 'rejected').length, 1);
});

test('rename failing with EPERM during takeover is treated as lost race, not as an error', async () => {
  writeLock({ pid: deadPid() });
  mock.method(fs, 'renameSync', () => {
    const e = new Error('operation not permitted');
    e.code = 'EPERM';
    throw e;
  });
  await assert.rejects(acquireLock({ owner: 'new', waitMs: 300, pollMs: 50 }), /held by pid/);
  mock.restoreAll();
  assert.equal(readLock().token, 'old-token');
});

test('the heartbeat refreshes the lock mtime and stops with release', async () => {
  const lock = await take({ owner: 'h', heartbeatMs: 50 });
  const file = lockPath();
  const hourAgo = new Date(Date.now() - HOUR);
  fs.utimesSync(file, hourAgo, hourAgo);
  await new Promise((r) => setTimeout(r, 400));
  assert.ok(Date.now() - fs.statSync(file).mtimeMs < 5000, 'mtime must be fresh again');
  releaseLock(lock.token);
  assert.equal(fs.existsSync(file), false);
  // Timers are unref'd and cleared: node --test only exits when nothing keeps the loop alive.
});

test('COURSES_LOCK_TOKEN matching the current token gives a reentrant lock and keeps the file', async () => {
  const lock = await take({ owner: 'parent' });
  process.env.COURSES_LOCK_TOKEN = lock.token;
  const again = await acquireLock({ owner: 'child', waitMs: 300, pollMs: 50 });
  assert.equal(again.reentrant, true);
  assert.equal(again.token, lock.token);
  assert.equal(readLock().owner, 'parent');
  assert.equal(fs.existsSync(lockPath()), true);
});
