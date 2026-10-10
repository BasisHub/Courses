# Sample test harness

This folder runs every BBj program under `docs/examples` on a local BBj 26.03, in DWC, and records what happens. You get one result per program and one baseline report. The harness never changes a sample: a red sample is a finding for you to read, not a failure of the harness.

What it does, in order:

1. **Compile.** Every `.bbj` goes through the BBj compiler twice: a syntax check and a type check (`npm run compile`).
2. **Register.** The harness registers each runnable program as a DWC app named `courses-<book>-<path>` through the BBj Admin API.
3. **Run.** Playwright opens each app in Chromium, one after another, and waits for the window, the console or a dialog.
4. **Classify.** A browser observation (window, console text, dialogs, page and console errors, failed requests, icons, `Debug.log`) becomes a verdict: `pass`, `fail` or `blocked`, with reasons.
5. **Report.** `npm run report` turns the results and your notes into `tools/data/sample-test-report.md`, the only file that is committed.

## Prerequisites

- BBj 26.03 with BBjServices running on `http://localhost:8888`, installed at `C:/bbx` (or set `BBJ_HOME`).
- Node 24 and `npm ci` in this folder.
- Chromium for Playwright 1.64.0: `npx playwright install chromium`.
- A file `tools/sample-test/.env` that git ignores. It holds `BBJ_ADMIN_USER` and `BBJ_ADMIN_PASSWORD`. Optional keys: `BBJ_HOME`, `BBJ_URL`, `JAVA_BIN`. Only the Java admin tool reads the credentials; nothing prints or stores them, and the report generator refuses to write a report that contains the password.

## Licenses

The machine has 3 BBJ licenses (and 2 WEBCUI). So the harness runs one program at a time (`workers: 1`) and ends every BBj session it starts.

- **Start no other BBj sessions during a baseline.** A license count that rises during a test and does not come back is flagged as a `license-leak` harness issue, and the baseline fails.
- **One run at a time.** Every live command takes a run lock (a file in the OS temp folder). The baseline holds it for its whole run and refreshes it with a heartbeat. A second command waits up to `COURSES_LOCK_WAIT_MS` (default one hour, in milliseconds) and then stops with the name of the holder.
- **Back to clean.** `npm run cleanup` terminates leftover harness sessions, removes every `courses-*` app and prints `CLEAN`. `npm run cleanup -- --force` skips the lock, for a lock that is stuck. Run it after any live run that you stopped half way.

Only sessions of programs under `docs/examples` or `tools/sample-test/fixtures` count as harness sessions. Other sessions are never touched.

## Commands

All commands run in `tools/sample-test`.

| Command | What it does | What it writes |
|---------|--------------|----------------|
| `npm run test:unit` | Unit and coverage tests. Needs no BBj session. | nothing |
| `npm run compile` | Syntax and type check of every sample with the BBj compiler (3 to 6 minutes). | `results/compile.json` |
| `npm run selftest` | The four control programs (good, broken, print, missing CSS) and the test wrappers. Proves the harness classifies correctly (about 4 minutes). | `results/selftest`, `results/selftest-behaviour` |
| `npm run samples` | One smoke test per runnable sample, then the behaviour tests. Red tests are findings (about 21 minutes for the 59 smoke tests alone, 20 s each). | `results/samples`, `results/behaviour`, `results/screenshots`, `results/console`, `results/debuglog` |
| `npm run baseline` | Everything: compile, unit tests, self-test, samples, completeness check, harness-issue check, leftover check, report. Takes 60 to 90 minutes; run it in the background. | all of the above, `results/baseline.json`, the report |
| `npm run report` | Builds `tools/data/sample-test-report.md` from `results/` and `report-notes.md`. | the report |
| `npm run cleanup` | Returns BBjServices to a clean state. | nothing |

Two more commands:

- `node check-behaviour.mjs [--prefix <id prefix>] [--issues 3,4|none]` lists the window and dialog samples, and the issue numbers, that have no behaviour test yet. It opens no BBj session. It exits 1 while something is missing.
- `node run-baseline.mjs --grep "<regex>"` runs the whole pipeline for a subset of the sample tests, for example `--grep "smoke \[dwc/01_GUI2BUI2DWC/DWC1.bbj\]"`. It keeps the old results, skips the completeness check and writes the report to `results/report-preview.md` instead of the committed file.

The exit code of `npm run baseline` is non-zero only for a **harness failure**: the compile pass did not cover every file, the unit tests or the self-test failed, a sample has no result, a result was blocked by a license problem or carries a harness issue (`license-leak`, `wrapper-error`), the run did not execute any test, something was left behind, or the report was refused. A red sample never fails the baseline.

## Results stay local

Everything under `tools/sample-test/results/` is ignored by git, and it stays on your machine. The WebCUI console shows a header with the license serial number, so screenshots, DOM dumps and raw console text can hold it. The result files and the report carry only text that has passed the serial filter, and the report generator refuses to write a report with a serial number, a local path, an em dash or the admin password in it.

| Folder or file | Content |
|----------------|---------|
| `results/samples/<app>.json` | One verdict per runnable sample (smoke) |
| `results/behaviour/<app>--<test>.json` | One verdict per behaviour test |
| `results/selftest/`, `results/selftest-behaviour/` | The same for the control programs and the wrapper self-tests |
| `results/screenshots/` | Light and dark screenshots, and the last screenshot of a timeout |
| `results/console/` | Raw console text (holds the serial number; never copy it) |
| `results/debuglog/` | Error lines that a program added to BBj's `Debug.log` |
| `results/compile.json` | The compile pass |
| `results/run.json`, `results/baseline.json` | Versions, and the harness failures of the last baseline |

## Read the results

Open `tools/data/sample-test-report.md` after a baseline. It has one row per manifest entry, a block per GitHub issue (#3 to #7), the findings per sample and a section for harness notes. Each row links a failure to its reasons. To look at a single sample, open its JSON in `results/samples` and its screenshots in `results/screenshots`.

A verdict has a **category** for every reason:

| Category | Meaning |
|----------|---------|
| `license` | No BBJ license was free; the program was never judged. This is a harness problem. |
| `start` | No window, console or dialog appeared, or the wrong one |
| `timeout` | The test hit its deadline (15 s below the test timeout). A finding. |
| `bbj` | A BBj `!ERROR` in the console or in an error dialog, with its line |
| `console` | The program ended and returned to `READY`, or showed a break dialog |
| `page` | A JavaScript error in the browser |
| `console-error` | `console.error` in the browser |
| `network-local`, `network-external` | A request failed or answered 4xx or 5xx, on this machine or elsewhere |
| `icons` | A visible `dwc-icon` did not render |
| `print` | Expected printed text is missing |
| `dialog` | The expected dialog did not appear |

Warnings (`title`, `console-output`, `console-warning`, `debug-log`) are recorded and do not fail a sample. Behaviour tests add the categories `assertion` (a check failed), `check` (the check could not be made) and `harness` (the wrapper itself broke).

**Red is data.** A sample that fails, hangs or crashes is a finding. The test still writes its result first and asserts afterwards, so a red sample leaves a file. Do not fix a sample to make the baseline green: the baseline records how the samples behave today.

## Add a sample or a behaviour test

1. **Manifest.** Add an entry to `manifest.json` (id, kind, entry program, pages, expectations). `npm run test:unit` checks that every `.bbj` under `docs/examples` has an entry.
2. **Smoke.** Nothing to do. `tests/smoke.spec.js` creates one test per runnable manifest entry, titled `smoke [<id>]`.
3. **Behaviour test.** Add a spec under `tests/behaviour/` and write the test with `behaviourTest`. The title format is fixed: the wrapper builds `[<id>] <title>`, or `[<id>] issue #<n>: <title>` when the test belongs to a GitHub issue, and `check-behaviour.mjs` relies on it.

```js
import { expect } from '../../lib/fixtures.js';
import { behaviourTest, BlockedError } from '../../lib/behaviour.js';

behaviourTest(
  'dwc/01_GUI2BUI2DWC/DWC2.bbj',
  'speaker icon renders',
  { issue: 4 },
  async ({ page, note }) => {
    const button = page.getByRole('button', { name: 'Say Hello' });
    await expect(button).toBeVisible();
    note('button found by role and visible text');
    if ((await page.locator('dwc-icon').count()) === 0) throw new BlockedError('no icon element on the page');
  },
);
```

- Find controls by role and visible text, never by hooks you add to a sample. Samples are only run, never changed.
- Throw `BlockedError` when the check cannot be made. Any other error is a failed check.
- Keep titles of two tests on the same sample different within their first 40 characters; the result file and the screenshot are named after the title.
- The wrapper opens the sample, answers a start dialog if the manifest names one, runs your body, then looks at the console: a BBj `!ERROR` after the body turns the verdict into a `fail` with category `bbj`.
- `npm run samples -- --grep "\[dwc/01_GUI2BUI2DWC/DWC2.bbj\]"` runs one sample's tests; end every live run with `npm run cleanup`.

## Last baseline

- Date: 2026-10-10 (16:56 to 17:49 UTC), 52 min 37 s end to end, exit 0, no harness failure.
- BBj REV 26.03, Chromium 156.0.8078.4, Playwright 1.64.0, DWC only.
- Smoke: 59 results, 41 pass, 18 fail, 0 blocked (16 console-error, 2 icons, 1 page; a sample can have several reasons).
- Behaviour: 105 results, 79 pass, 26 fail, 0 blocked.
- Compile: 63 files, 0 syntax errors, 8 type-check findings in 4 files.
- Red results are findings for the fix phase, not harness failures. The full analysis is in `tools/data/sample-test-report.md`.
