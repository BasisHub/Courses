// Runs once before the first test, in the Playwright runner process: take the run lock, snapshot
// the BBj sessions, sweep leftovers, register every app, record the run info. All cleanup lives in
// global-teardown.js. Playwright 1.64 runs the teardown even when this setup fails, so a failure
// here needs no cleanup of its own. The teardown acts only when COURSES_RUN_ACTIVE is set, which
// happens right after the lock is held: a setup that never got the lock must not sweep or
// unregister while another run holds it.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { allApps } from './lib/apps.js';
import { registerMany, sweep, takeRunSnapshot } from './lib/admin.js';
import { acquireLock } from './lib/lock.js';
import { envFile, envKeyNames, harnessDir, resultsDir } from './lib/paths.js';

export default async function globalSetup() {
  // Credentials first: a missing key fails before the run takes the lock or touches BBjServices.
  const keys = envKeyNames(envFile());
  if (!keys.includes('BBJ_ADMIN_USER') || !keys.includes('BBJ_ADMIN_PASSWORD')) {
    throw new Error('tools/sample-test/.env needs BBJ_ADMIN_USER and BBJ_ADMIN_PASSWORD');
  }

  const { token, reentrant } = await acquireLock({ owner: 'playwright' });
  // The Playwright worker and the teardown find the lock and the run snapshot through these.
  process.env.COURSES_LOCK_TOKEN = token;
  if (!reentrant) process.env.COURSES_LOCK_OWNED = '1';
  process.env.COURSES_RUN_ACTIVE = '1';

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
}
