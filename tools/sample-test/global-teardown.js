// Runs once after the last test: sweep harness sessions, remove every courses-* app, report what is
// left and release the run lock this run owns. KEEP_APPS=1 keeps the apps for manual inspection
// (npm run cleanup removes them later).
import { isHarnessSession, listApps, readRunSnapshot, status, sweep, unregister } from './lib/admin.js';
import { releaseLock } from './lib/lock.js';

export default async function globalTeardown() {
  try {
    const killed = await sweep();
    console.log(`teardown: terminated ${killed.length} harness session(s)`);

    if (process.env.KEEP_APPS === '1') {
      console.log('teardown: KEEP_APPS=1, apps stay registered (npm run cleanup removes them)');
    } else {
      const t0 = Date.now();
      const removed = await unregister('courses-');
      console.log(`teardown: removed ${removed.length} apps in ${Date.now() - t0} ms`);
    }

    // A terminated session can stay listed for a moment: look up to three times.
    let sessions = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      const { processes } = await status();
      sessions = processes.filter((p) => isHarnessSession(p, { knownIds: readRunSnapshot() }));
      if (!sessions.length) break;
      if (attempt < 2) {
        await sweep();
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    const apps = process.env.KEEP_APPS === '1' ? [] : await listApps('courses-');
    if (!apps.length && !sessions.length) {
      console.log('teardown: CLEAN');
    } else {
      for (const a of apps) console.log(`teardown: LEFTOVER app ${a.name}`);
      for (const s of sessions) console.log(`teardown: LEFTOVER session ${s.id}`);
    }
  } finally {
    if (process.env.COURSES_LOCK_OWNED === '1' && process.env.COURSES_LOCK_TOKEN) {
      releaseLock(process.env.COURSES_LOCK_TOKEN);
      delete process.env.COURSES_LOCK_OWNED;
    }
  }
}
