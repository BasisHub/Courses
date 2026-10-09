// Playwright `test` with the `bbj` fixture. A test that opens a BBj program asks for `bbj`. Before
// the test the fixture waits for a free BBJ license (sweeping harness leftovers meanwhile) and
// records the session ids. After the test it closes the page and terminates every new harness
// session, so no sample or control program outlives its test (3 BBJ licenses, T-06.2-12).
//
//   bbj = { page, licenseFree, before: Set<string>, testInfo }
//
// licenseFree is false when no license became free within 60 s: the test reports that instead of
// opening a program that would show a license-error dialog.
import { test as base, expect } from '@playwright/test';
import { killIds, newHarnessSessions, status, waitForLicense } from './admin.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const test = base.extend({
  bbj: [
    async ({ page }, use, testInfo) => {
      const licenseFree = await waitForLicense({ feature: 'BBJ', timeoutMs: 60000 });
      if (!licenseFree) testInfo.annotations.push({ type: 'no-license', description: 'no BBJ license became free within 60 s' });
      const before = new Set((await status()).processes.map((p) => String(p.id)));
      try {
        await use({ page, licenseFree, before, testInfo });
      } finally {
        await page.close().catch(() => {});
        // A terminated session can stay listed for a moment: terminate, wait, look again.
        let mine = newHarnessSessions(before, (await status()).processes);
        for (let attempt = 0; mine.length && attempt < 2; attempt++) {
          await killIds(mine.map((p) => p.id));
          await sleep(1000);
          mine = newHarnessSessions(before, (await status()).processes);
        }
        if (mine.length) {
          testInfo.annotations.push({ type: 'leftover-session', description: mine.map((p) => p.id).join(',') });
        }
      }
    },
    { timeout: 90000 },
  ],
});

export { expect };
