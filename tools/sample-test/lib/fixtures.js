// Playwright `test` with the `bbj` fixture. A test that opens a BBj program asks for `bbj`. Before
// the test the fixture waits for a free BBJ license (sweeping harness leftovers meanwhile) and
// records the session ids and the BBJ licenses in use. After the test it closes the page and
// terminates every new harness session, so no sample or control program outlives its test (3 BBJ
// licenses, T-06.2-12). Then it checks the licenses: when more are in use than before the test, the
// result files the test registered are flagged 'license-leak' (W5).
//
//   bbj = { page, licenseFree, before: Set<string>, licensesBefore: number, testInfo, recordResult(file) }
//
// licenseFree is false when no license became free within 60 s: the test reports that instead of
// opening a program that would show a license-error dialog. recordResult registers an absolute path
// of a result file written during the test; runProgram and the behaviour wrapper call it.
import { test as base, expect } from '@playwright/test';
import { killIds, newHarnessSessions, status, waitForLicense } from './admin.js';
import { findLeak } from './leak.js';
import { markHarnessIssue } from './results.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// How long a terminated session may keep its license before it counts as a leak.
const LICENSE_RELEASE_WAIT_MS = 10000;
const LICENSE_RELEASE_POLL_MS = 1000;

export const test = base.extend({
  bbj: [
    async ({ page }, use, testInfo) => {
      const licenseFree = await waitForLicense({ feature: 'BBJ', timeoutMs: 60000 });
      if (!licenseFree) testInfo.annotations.push({ type: 'no-license', description: 'no BBJ license became free within 60 s' });
      const s0 = await status();
      const before = new Set(s0.processes.map((p) => String(p.id)));
      const licensesBefore = s0.licenses.BBJ.inUse;
      const files = [];
      try {
        await use({
          page,
          licenseFree,
          before,
          licensesBefore,
          testInfo,
          recordResult: (file) => {
            files.push(file);
          },
        });
      } finally {
        await page.close().catch(() => {});
        // A terminated session can stay listed for a moment: terminate, wait, look again.
        let now = await status();
        let mine = newHarnessSessions(before, now.processes);
        for (let attempt = 0; mine.length && attempt < 2; attempt++) {
          await killIds(mine.map((p) => p.id));
          await sleep(1000);
          now = await status();
          mine = newHarnessSessions(before, now.processes);
        }
        if (mine.length) {
          testInfo.annotations.push({ type: 'leftover-session', description: mine.map((p) => p.id).join(',') });
        }

        // W5: licenses still in use after the cleanup? A license can take a moment to come back.
        const deadline = Date.now() + LICENSE_RELEASE_WAIT_MS;
        while (findLeak(before, licensesBefore, now) && Date.now() < deadline) {
          await sleep(LICENSE_RELEASE_POLL_MS);
          now = await status();
        }
        const leaked = findLeak(before, licensesBefore, now);
        if (leaked) {
          // Listed only: nothing outside the harness session rule is terminated here.
          markHarnessIssue(files, 'license-leak', { leaked });
          testInfo.annotations.push({ type: 'license-leak', description: leaked.map((l) => l.id).join(',') });
        }
      }
    },
    { timeout: 90000 },
  ],
});

export { expect };
