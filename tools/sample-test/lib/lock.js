// Cross-worktree run lock for live BBj runs. The machine has 3 BBJ licenses, so only one harness
// run may talk to BBjServices at a time, even when GSD executes plans in parallel git worktrees.
//
// The lock is a file in the OS temp folder, created exclusively (flag 'wx'). The holder refreshes
// the file's mtime on a timer (heartbeat). A lock is stale when its process is gone or its mtime
// is older than STALE_MS. A stale lock is taken over by renaming it to a unique name (only one
// process can win the rename) and then creating a fresh lock.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function lockPath() {
  return process.env.COURSES_LOCK_FILE || path.join(os.tmpdir(), 'courses-sample-test-bbj.lock');
}

export const STALE_MS = 4 * 60 * 60 * 1000;

const heartbeats = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
}

function tryCreate(file, owner) {
  let fd;
  try {
    fd = fs.openSync(file, 'wx');
  } catch (e) {
    if (e.code === 'EEXIST') return null;
    throw e;
  }
  const info = { token: crypto.randomUUID(), pid: process.pid, owner, startedAt: new Date().toISOString() };
  try {
    fs.writeSync(fd, JSON.stringify(info));
  } finally {
    fs.closeSync(fd);
  }
  return info;
}

// -> { raw, info, mtimeMs } or null when the file is gone or not (yet) readable JSON.
function readLock(file) {
  let raw;
  let mtimeMs;
  try {
    raw = fs.readFileSync(file, 'utf8');
    mtimeMs = fs.statSync(file).mtimeMs;
  } catch {
    return null;
  }
  try {
    const info = JSON.parse(raw);
    if (info && typeof info === 'object') return { raw, info, mtimeMs };
  } catch {
    // fall through: another process may be between create and write, or mid-takeover
  }
  return { raw, info: null, mtimeMs };
}

function isStale(lock) {
  if (!lock.info) {
    // Unreadable content: a writer needs milliseconds; after 30 s it is a crashed writer.
    return Date.now() - lock.mtimeMs > 30000;
  }
  return !pidAlive(lock.info.pid) || Date.now() - lock.mtimeMs > STALE_MS;
}

// Take a stale lock over by renaming it away. Only one process wins the rename.
// -> true when this process removed the stale lock and may create a new one at once.
function takeOver(file, judged) {
  const moved = `${file}.stale-${process.pid}-${Date.now()}`;
  try {
    fs.renameSync(file, moved);
  } catch (e) {
    // ENOENT: another process won. EPERM/EBUSY/EACCES: Windows while the holder touches the file.
    if (['ENOENT', 'EPERM', 'EBUSY', 'EACCES'].includes(e.code)) return false;
    throw e;
  }
  let movedRaw = null;
  try {
    movedRaw = fs.readFileSync(moved, 'utf8');
  } catch {
    // unreadable: treat as not the lock we judged
  }
  if (movedRaw !== judged.raw) {
    // Another process replaced the lock between our read and our rename: we moved a fresh lock.
    try {
      fs.linkSync(moved, file);
    } catch (e) {
      if (e.code !== 'EEXIST') {
        try {
          fs.copyFileSync(moved, file, fs.constants.COPYFILE_EXCL);
        } catch {
          // someone else already created a new lock: leave it
        }
      }
    }
    fs.rmSync(moved, { force: true });
    return false;
  }
  fs.rmSync(moved, { force: true });
  return true;
}

function startHeartbeat(file, token, heartbeatMs) {
  const timer = setInterval(() => {
    try {
      const info = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (info.token !== token) return;
      const now = new Date();
      fs.utimesSync(file, now, now);
    } catch {
      // file gone or mid-rename: nothing to refresh
    }
  }, heartbeatMs);
  timer.unref();
  heartbeats.set(token, timer);
}

/**
 * Acquire the run lock, waiting up to waitMs. A child process that gets COURSES_LOCK_TOKEN of the
 * current holder from the environment gets { reentrant: true } and must not release it.
 * -> { token, reentrant }
 */
export async function acquireLock({
  owner,
  waitMs = Number(process.env.COURSES_LOCK_WAIT_MS) || 3600000,
  pollMs = 2000,
  heartbeatMs = Number(process.env.COURSES_LOCK_HEARTBEAT_MS) || 300000,
} = {}) {
  const file = lockPath();
  const deadline = Date.now() + waitMs;
  let last = null;
  for (;;) {
    const created = tryCreate(file, owner);
    if (created) {
      startHeartbeat(file, created.token, heartbeatMs);
      return { token: created.token, reentrant: false };
    }
    const lock = readLock(file);
    last = lock;
    if (lock && lock.info) {
      if (process.env.COURSES_LOCK_TOKEN && lock.info.token === process.env.COURSES_LOCK_TOKEN) {
        return { token: lock.info.token, reentrant: true };
      }
    }
    if (lock && isStale(lock)) {
      if (takeOver(file, lock)) continue;
    }
    if (Date.now() >= deadline) break;
    await sleep(pollMs);
  }
  const info = (last && last.info) || {};
  throw new Error(
    `BBj run lock held by pid ${info.pid ?? 'unknown'} (${info.owner ?? 'unknown'}) since ${
      info.startedAt ?? 'unknown'
    }; wait (COURSES_LOCK_WAIT_MS) or run npm run cleanup -- --force`,
  );
}

/** Stop the heartbeat and delete the lock file when it still carries this token. Never throws. */
export function releaseLock(token) {
  const timer = heartbeats.get(token);
  if (timer) {
    clearInterval(timer);
    heartbeats.delete(token);
  }
  const file = lockPath();
  try {
    const info = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (info.token === token) fs.rmSync(file, { force: true });
  } catch {
    // file gone or unreadable: nothing to release
  }
}
