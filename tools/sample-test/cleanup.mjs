// npm run cleanup: the one command that returns the local BBjServices to a clean state (SAMP-03).
// It terminates leftover harness sessions, removes every courses-* app and prints CLEAN when
// nothing is left.
//
//   node cleanup.mjs           take the BBj run lock first (waits up to COURSES_LOCK_WAIT_MS)
//   node cleanup.mjs --force   skip the lock, for a lock that is stuck
//
// Only sessions of the harness are terminated: programs under <checkout>/docs/examples/ or
// <checkout>/tools/sample-test/fixtures/, plus `<initializing>` sessions that appeared after the
// run-start snapshot. Sessions of other programs are never touched.
import { acquireLock, releaseLock } from './lib/lock.js';
import { isHarnessSession, listApps, readRunSnapshot, status, sweep, takeRunSnapshot, unregister } from './lib/admin.js';
import { harnessRoots } from './lib/paths.js';

const force = process.argv.includes('--force');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lock = null;
try {
  if (!force) lock = await acquireLock({ owner: 'cleanup' });

  // W9: without a snapshot of this run, no `<initializing>` session is touched.
  const known = !lock
    ? readRunSnapshot()
    : lock.reentrant
      ? readRunSnapshot(lock.token)
      : await takeRunSnapshot(lock.token);

  const killed = await sweep({ knownIds: known });
  console.log(`terminated ${killed.length} harness session(s)`);

  const removed = await unregister('courses-');
  console.log(`removed ${removed.length} app(s)`);

  // A terminated session can stay listed for a moment: look up to three times.
  const roots = harnessRoots();
  let sessions = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const { processes } = await status();
    sessions = processes.filter((p) => isHarnessSession(p, { roots, knownIds: known }));
    if (!sessions.length) break;
    if (attempt < 2) {
      await sweep({ knownIds: known });
      await sleep(2000);
    }
  }
  const apps = await listApps('courses-');

  for (const a of apps) console.log(`LEFTOVER app ${a.name}`);
  for (const s of sessions) console.log(`LEFTOVER session ${s.id} ${s.program}`);
  if (apps.length || sessions.length) {
    process.exitCode = 1;
  } else {
    console.log('CLEAN');
  }
} catch (e) {
  console.error(`cleanup failed: ${e.message}`);
  process.exitCode = 1;
} finally {
  if (lock && !lock.reentrant) releaseLock(lock.token);
}
