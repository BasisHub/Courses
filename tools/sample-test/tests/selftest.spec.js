// Lifecycle self-tests: prove that the run lifecycle (register, open, terminate, unregister) works
// on the local BBjServices with the known-good control program. Plan 08 adds the observation and
// classification checks. The tests run in file order.
import { test, expect } from '../lib/fixtures.js';
import { appUrl, fixtureApps } from '../lib/apps.js';
import { isHarnessSession, listApps, newHarnessSessions, status } from '../lib/admin.js';
import { toPosix } from '../lib/paths.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('lifecycle: every fixture is registered', async () => {
  const registered = await listApps('courses-fixture-');
  for (const app of fixtureApps()) {
    const file = app.id.replace(/^fixture\//, '');
    const found = registered.find((r) => r.name === app.name);
    expect(found, `${app.name} is registered`).toBeTruthy();
    expect(toPosix(found.program).toLowerCase().endsWith(`fixtures/${file}`.toLowerCase())).toBe(true);
  }
});

test('lifecycle: known-good opens a DWC window', async ({ bbj }) => {
  const { page } = bbj;
  expect(bbj.licenseFree, 'a BBJ license is free').toBe(true);

  await page.goto(appUrl('courses-fixture-known-good'));
  await expect(page.locator('dwc-window-content').first()).toBeAttached({ timeout: 30000 });
  await expect(page).toHaveTitle('Courses fixture good');

  // While the page is open: the session must show up as a harness session, and its program name
  // tells us the format the Admin API reports. A session can sit at <initializing> for a moment.
  let mine = [];
  for (let attempt = 0; attempt < 10; attempt++) {
    mine = newHarnessSessions(bbj.before, (await status()).processes);
    if (mine.length && mine.every((p) => p.program !== '<initializing>')) break;
    await sleep(1000);
  }
  expect(mine.length, 'the open program is a new harness session').toBeGreaterThan(0);
  for (const p of mine) {
    bbj.testInfo.annotations.push({ type: 'program-name', description: p.program });
  }
});

test('lifecycle: the previous test left no fixture session', async () => {
  const { processes } = await status();
  const left = processes.filter(
    (p) => isHarnessSession(p) && toPosix(p.program).toLowerCase().includes('fixtures/'),
  );
  expect(left.map((p) => p.id), 'fixture sessions still listed').toEqual([]);
});
