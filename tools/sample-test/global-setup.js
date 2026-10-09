// Runs once before the first test, in the Playwright runner process: take the run lock, snapshot
// the BBj sessions, sweep leftovers, register every app, record the run info. All regular cleanup
// lives in global-teardown.js. When setup itself fails, Playwright does not call the teardown, so
// this file undoes what it did (only when it owns the lock) before it rethrows.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { allApps } from './lib/apps.js';
import { registerMany, sweep, takeRunSnapshot } from './lib/admin.js';
import { acquireLock, releaseLock } from './lib/lock.js';
import { envFile, envKeyNames, harnessDir, resultsDir } from './lib/paths.js';
import globalTeardown from './global-teardown.js';

export default async function globalSetup() {
  const { token, reentrant } = await acquireLock({ owner: 'playwright' });
  // Child processes (the Playwright worker) and the teardown find the lock and the run snapshot
  // through these variables.
  process.env.COURSES_LOCK_TOKEN = token;
  if (!reentrant) process.env.COURSES_LOCK_OWNED = '1';

  try {
    const keys = envKeyNames(envFile());
    if (!keys.includes('BBJ_ADMIN_USER') || !keys.includes('BBJ_ADMIN_PASSWORD')) {
      throw new Error('tools/sample-test/.env needs BBJ_ADMIN_USER and BBJ_ADMIN_PASSWORD');
    }

    // W9: the snapshot tells sweep() which `<initializing>` sessions existed before this run. When
    // the lock is re-entered, run-baseline.mjs already took it.
    if (!reentrant) await takeRunSnapshot(token);
    const killed = await sweep();
    console.log(`setup: terminated ${killed.length} harness session(s)`);

    const apps = allApps();
    const t0 = Date.now();
    const result = await registerMany(apps.map(({ name, program, workdir }) => ({ name, program, workdir })));
    const ms = Date.now() - t0;
    const problems = result.failures.map((f) => `${f.name}: ${f.reason}`);
    for (const app of apps) {
      const url = result.urls[app.name];
      if (!url || !url.endsWith(`/webapp/${app.name}`)) problems.push(`${app.name}: unexpected URL ${url ?? '(none)'}`);
    }
    if (problems.length) throw new Error(`registering apps failed:\n  ${problems.join('\n  ')}`);
    console.log(`setup: registered ${apps.length} apps in ${ms} ms`);

    const browser = await chromium.launch();
    const chromiumVersion = browser.version();
    await browser.close();
    const pkg = JSON.parse(
      fs.readFileSync(path.join(harnessDir, 'node_modules', '@playwright', 'test', 'package.json'), 'utf8'),
    );
    fs.writeFileSync(
      resultsDir('run.json'),
      `${JSON.stringify(
        { startedAt: new Date().toISOString(), playwright: pkg.version, chromium: chromiumVersion, apps: apps.length },
        null,
        2,
      )}\n`,
      'utf8',
    );
  } catch (e) {
    if (!reentrant) {
      try {
        await globalTeardown();
      } catch (cleanupError) {
        console.error(`setup: cleanup after a failed setup also failed: ${cleanupError.message}`);
        releaseLock(token);
      }
    }
    throw e;
  }
}
