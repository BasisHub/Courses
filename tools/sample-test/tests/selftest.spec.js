// Self-test of the harness on the four control programs. First the run lifecycle (register, open,
// terminate), then the observation and classification of each control, the click on the known-good
// button, and the dark screenshot. Then the behaviour wrapper is proven on the controls: a pass, a
// fail, a BBj error, a blocked check and a timeout. The last test proves that no control session is
// left. The tests run in file order.
import fs from 'node:fs';
import { test, expect } from '../lib/fixtures.js';
import { appById, appUrl, fixtureApps } from '../lib/apps.js';
import { isHarnessSession, listApps, newHarnessSessions, status } from '../lib/admin.js';
import { BlockedError, behaviourTest } from '../lib/behaviour.js';
import { readDialogs, settle } from '../lib/dwc.js';
import { resultsDir, toPosix } from '../lib/paths.js';
import { readResults } from '../lib/results.js';
import { runProgram, startProgram } from '../lib/run.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const expected = JSON.parse(fs.readFileSync(new URL('../fixtures/expected.json', import.meta.url), 'utf8'));

// Where the known-good control wrote its screenshots in its classification test (relative to the
// results folder), for the dark screenshot test.
const shots = {};

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

// One classification test per control program, taken from fixtures/expected.json, so the unit tests
// (lib/classify.test.js) and this live test share their expectations.
for (const [file, spec] of Object.entries(expected)) {
  test(`control: ${file} is classified ${spec.classification.status}`, async ({ bbj }) => {
    expect(bbj.licenseFree, 'a BBJ license is free').toBe(true);
    const app = appById(`fixture/${file}`);
    const r = await runProgram(bbj, app, { dir: 'selftest' });
    const why = JSON.stringify(r.reasons);

    expect(r.status, why).toBe(spec.classification.status);
    if (spec.classification.category) {
      expect(r.reasons.map((x) => x.category), why).toContain(spec.classification.category);
    }
    if (spec.classification.bbjError) {
      expect(r.bbjErrors[0], why).toMatchObject(spec.classification.bbjError);
    }
    if (spec.expect.print) {
      for (const line of spec.expect.print) {
        expect(r.printed.some((p) => p.includes(line)), `printed ${JSON.stringify(r.printed)} has "${line}"`).toBe(true);
      }
      expect(r.bbjVersion).toMatch(/26\.03/);
    }
    if (spec.classification.network) {
      const { status: httpStatus, urlIncludes } = spec.classification.network;
      expect(
        r.network.some((n) => n.status === httpStatus && n.url.includes(urlIncludes)),
        `network ${JSON.stringify(r.network)} has ${httpStatus} for ${urlIncludes}`,
      ).toBe(true);
      // One request, one entry: the abort Chromium adds after the 404 is folded into it.
      expect(r.network.filter((n) => n.url.includes(urlIncludes)), 'one entry for the stylesheet').toHaveLength(1);
    }

    // The console header holds the license serial number: no result may carry it.
    expect(JSON.stringify(r)).not.toMatch(/BBX\d{6}|serial\s+number\s*:/i);
    expect(r.harnessIssue).toBeNull();

    if (app.kind === 'window') {
      for (const key of ['light', 'dark']) {
        expect(r.screenshots[key], `${key} screenshot path`).toBeTruthy();
        expect(fs.statSync(resultsDir(r.screenshots[key])).size, `${key} screenshot size`).toBeGreaterThan(0);
      }
    }
    if (file === 'known-good.bbj') {
      shots.light = r.screenshots.light;
      shots.dark = r.screenshots.dark;
    }
  });
}

test('control: known-good shows its message box on Say Hello', async ({ bbj }) => {
  expect(bbj.licenseFree, 'a BBJ license is free').toBe(true);
  const spec = expected['known-good.bbj'].interaction;
  const app = appById('fixture/known-good.bbj');
  const started = await startProgram(bbj, app);
  expect(started.start.state).toBe('window');

  await bbj.page.getByRole('button', { name: spec.button }).click();
  let dialogs = [];
  for (let attempt = 0; attempt < 10 && dialogs.length === 0; attempt++) {
    await settle(bbj.page, 500);
    dialogs = await readDialogs(bbj.page);
  }
  expect(dialogs.length, 'a message box appeared').toBeGreaterThan(0);
  expect(dialogs[0].text).toContain(spec.dialogText);
  expect(dialogs[0].title).toBe('Fixture');
  expect(dialogs[0].buttons).toContain('OK');
});

test('control: dark screenshot differs from light', async () => {
  expect(shots.light, 'the known-good classification test ran first').toBeTruthy();
  const light = fs.readFileSync(resultsDir(shots.light));
  const dark = fs.readFileSync(resultsDir(shots.dark));
  expect(light.length).toBeGreaterThan(0);
  expect(dark.equals(light), 'light and dark PNG files differ').toBe(false);
});

// The behaviour wrapper (lib/behaviour.js) on the controls. The four tests that must end red carry
// expectFailure, so a deliberately red test keeps the self-test green; the result test after them
// reads what the wrapper wrote and checks that every verdict is the intended one.
behaviourTest('fixture/known-good.bbj', 'wrapper records a pass', {}, async ({ page }) => {
  await page.getByRole('button', { name: 'Say Hello' }).click();
  await expect(page.locator('dwc-dialog')).toContainText('Hello fixture');
});

behaviourTest('fixture/known-good.bbj', 'wrapper records a fail', { expectFailure: true }, async ({ page }) => {
  await expect(page.getByText('text that is not there')).toBeVisible({ timeout: 2000 });
});

// The program crashes at line 4 after its window appears; the body does nothing.
behaviourTest('fixture/known-broken.bbj', 'wrapper turns a BBj error into fail', { expectFailure: true }, async () => {});

behaviourTest('fixture/known-good.bbj', 'wrapper records blocked', { expectFailure: true }, async () => {
  throw new BlockedError('oracle element missing');
});

// W6: a body that does not finish still leaves a result.
behaviourTest('fixture/known-good.bbj', 'wrapper records a timeout', { expectFailure: true, deadlineMs: 5000 }, async () => {
  await new Promise((resolve) => setTimeout(resolve, 20000));
});

test('wrapper results are recorded', async () => {
  const byTest = new Map(readResults('selftest-behaviour').map((r) => [r.test, r]));
  const get = (name) => {
    const found = byTest.get(name);
    expect(found, `a result for "${name}"`).toBeTruthy();
    return found;
  };

  const pass = get('wrapper records a pass');
  expect(pass.outcome, JSON.stringify(pass)).toBe('pass');
  expect(pass.category).toBeNull();

  const fail = get('wrapper records a fail');
  expect(fail.outcome).toBe('fail');
  expect(fail.category).toBe('assertion');
  expect(fail.evidence).toMatch(/^failed:/);

  const broken = get('wrapper turns a BBj error into fail');
  expect(broken.outcome, JSON.stringify(broken)).toBe('fail');
  expect(broken.category).toBe('bbj');
  expect(broken.evidence).toContain('!ERROR=252');
  expect(broken.evidence).toContain('line 4');

  const blocked = get('wrapper records blocked');
  expect(blocked.outcome).toBe('blocked');
  expect(blocked.category).toBe('check');
  expect(blocked.evidence).toBe('oracle element missing');

  const timeout = get('wrapper records a timeout');
  expect(timeout.outcome, JSON.stringify(timeout)).toBe('fail');
  expect(timeout.category).toBe('timeout');
  expect(timeout.evidence).toMatch(/^timed out/);
  expect(timeout.screenshot, 'timeout screenshot').toBeTruthy();
  expect(fs.statSync(resultsDir(timeout.screenshot)).size, 'timeout screenshot size').toBeGreaterThan(0);

  for (const r of byTest.values()) {
    expect(r.harnessIssue, `${r.test} has no harness issue`).toBeNull();
    expect(JSON.stringify(r)).not.toMatch(/BBX\d{6}|serial\s+number\s*:/i);
  }
});

test('lifecycle: the previous test left no fixture session', async () => {
  const { processes } = await status();
  const left = processes.filter(
    (p) => isHarnessSession(p) && toPosix(p.program).toLowerCase().includes('fixtures/'),
  );
  expect(left.map((p) => p.id), 'fixture sessions still listed').toEqual([]);
});
