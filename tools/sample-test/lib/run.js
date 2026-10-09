// One call that opens a registered program in DWC, observes it, classifies it and writes its result
// file. Smoke tests use runProgram; behaviour tests use startProgram and observe separately.
//
//   startProgram(bbj, app)          open the program and wait for window, console, dialog or license
//   observe(bbj, app, started)      settle, read console, dialogs, title, icons, Debug.log, screenshots
//   runProgram(bbj, app)            start + observe + classify + write results/<dir>/<app>.json
//
// `bbj` is the fixture object from lib/fixtures.js, `app` an App from lib/apps.js.
import fs from 'node:fs';
import path from 'node:path';
import { appUrl } from './apps.js';
import { classify } from './classify.js';
import { redact } from './console.js';
import {
  attachCollectors,
  clickDialogButton,
  consolePresent,
  iconReport,
  readConsole,
  readDialogs,
  settle,
  takeScreenshots,
  waitForStart,
} from './dwc.js';
import { bbjHome, resultsDir } from './paths.js';
import { writeConsoleRaw, writeSampleResult } from './results.js';
import { emptyObserved, makeSampleResult } from './schema.js';

const MAX_DELTA_BYTES = 4 * 1024 * 1024;
const MAX_ERROR_LINES_KEPT = 200;

function logFolder() {
  return `${bbjHome()}/log`;
}

/**
 * The newest file named Debug.log* in the BBj log folder (BBj rotates it daily as
 * Debug.log.YYYY-MM-DD.0) and its size, taken before a program starts.
 * @returns {{ file: string, size: number }|null} null when there is no such file
 */
export function debugLogMark() {
  let names;
  try {
    names = fs.readdirSync(logFolder());
  } catch {
    return null;
  }
  let newest = null;
  for (const name of names) {
    if (!name.startsWith('Debug.log')) continue;
    const file = path.join(logFolder(), name);
    try {
      const stat = fs.statSync(file);
      if (stat.isFile() && (!newest || stat.mtimeMs > newest.mtimeMs)) {
        newest = { file, size: stat.size, mtimeMs: stat.mtimeMs };
      }
    } catch {
      // the file vanished between the listing and the stat: skip it
    }
  }
  return newest ? { file: newest.file, size: newest.size } : null;
}

/**
 * What was appended to the marked Debug.log file since the mark (the same file only: a rotation in
 * between is not followed). Error lines (/error|exception/i) are also written, redacted, to
 * results/debuglog/<app>.txt when an app name is given.
 * @param {{ file: string, size: number }|null} mark
 * @param {{ app?: string|null }} [options]
 * @returns {{ file: string|null, newLines: number, errorLines: number }}
 */
export function debugLogDelta(mark, { app = null } = {}) {
  if (!mark) return { file: null, newLines: 0, errorLines: 0 };
  const name = path.basename(mark.file);
  let text = '';
  try {
    const size = fs.statSync(mark.file).size;
    if (size > mark.size) {
      const length = Math.min(size - mark.size, MAX_DELTA_BYTES);
      const fd = fs.openSync(mark.file, 'r');
      try {
        const buffer = Buffer.alloc(length);
        fs.readSync(fd, buffer, 0, length, mark.size);
        text = buffer.toString('utf8');
      } finally {
        fs.closeSync(fd);
      }
    }
  } catch {
    return { file: name, newLines: 0, errorLines: 0 };
  }
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  const errors = lines.filter((line) => /error|exception/i.test(line));
  if (app && errors.length > 0) {
    const kept = errors.slice(0, MAX_ERROR_LINES_KEPT).map(redact);
    fs.writeFileSync(resultsDir('debuglog', `${app}.txt`), `${kept.join('\n')}\n`, 'utf8');
  }
  return { file: name, newLines: lines.length, errorLines: errors.length };
}

/**
 * Opens the program and waits until it shows a window, the console, a dialog or a license error.
 * When no BBJ license is free the program is not opened at all (state 'license'). A configured start
 * dialog (expect.startDialog, for example a question the program asks first) is answered with its
 * button. For window and starter programs that print before they open their window, the start state
 * is 'window' once the window appears within 10 s.
 * @param {{ page: import('@playwright/test').Page, licenseFree: boolean }} bbj
 * @param {import('./apps.js').App} app
 * @param {{ startDialog?: { button: string }|null, timeoutMs?: number }} [options]
 * @returns {Promise<{ collectors: ReturnType<typeof attachCollectors>, startedAt: string, t0: number, start: { state: string, ms: number }, mark: { file: string, size: number }|null }>}
 */
export async function startProgram(
  bbj,
  app,
  { startDialog = app.expect?.startDialog ?? null, timeoutMs = 30000 } = {},
) {
  const { page } = bbj;
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const collectors = attachCollectors(page);
  const mark = debugLogMark();
  if (!bbj.licenseFree) {
    return { collectors, startedAt, t0, start: { state: 'license', ms: 0 }, mark };
  }

  await page.goto(appUrl(app.name), { waitUntil: 'load' });
  let start = await waitForStart(page, { timeoutMs });

  if (start.state === 'dialog' && startDialog) {
    await clickDialogButton(page, startDialog.button);
    const next = await waitForStart(page, { timeoutMs, states: ['window', 'console'] });
    start = { state: next.state, ms: start.ms + next.ms };
  }

  if (start.state === 'console' && (app.kind === 'window' || app.kind === 'starter')) {
    const lines = await readConsole(page, { waitForReadyMs: 0 });
    const ended = Array.isArray(lines) && lines.some((line) => line.trim() === 'READY');
    if (!ended) {
      const next = await waitForStart(page, { timeoutMs: 10000, states: ['window'] });
      if (next.state === 'window') start = { state: 'window', ms: start.ms + next.ms };
    }
  }
  return { collectors, startedAt, t0, start, mark };
}

/**
 * Looks at the page after the start: console text, dialogs, title, icons, new Debug.log lines and a
 * light and a dark screenshot. Returns an Observed object (see schema.js) plus `screenshots` and the
 * collector extras (nativeDialogs, downloads, popups). Nothing here is stored except the raw console
 * text, which goes to results/console (ignored) because its header holds the license serial.
 * @param {{ page: import('@playwright/test').Page, licenseFree: boolean }} bbj
 * @param {import('./apps.js').App} app
 * @param {Awaited<ReturnType<typeof startProgram>>} started
 * @param {{ screenshots?: boolean, shotName?: string }} [options]
 */
export async function observe(bbj, app, started, { screenshots = true, shotName = app.name } = {}) {
  const { page } = bbj;
  const { collectors, mark } = started;
  const base = {
    ...emptyObserved(),
    start: started.start,
    pageErrors: [...collectors.pageErrors],
    consoleErrors: [...collectors.consoleErrors],
    consoleWarnings: [...collectors.consoleWarnings],
    network: [...collectors.network],
    nativeDialogs: [...collectors.nativeDialogs],
    downloads: [...collectors.downloads],
    popups: [...collectors.popups],
    screenshots: { light: null, dark: null },
  };
  // No license: the program was never opened, there is nothing on the page to look at.
  if (!bbj.licenseFree) return { ...base, debugLog: debugLogDelta(mark, { app: app.name }) };

  await settle(page);
  let consoleLines = null;
  if (await consolePresent(page)) {
    consoleLines = await readConsole(page);
  } else {
    // A program that crashes right after it started shows its window first and the console later.
    await settle(page, 1000);
    if (await consolePresent(page)) consoleLines = await readConsole(page);
  }
  if (consoleLines) writeConsoleRaw(app, consoleLines);

  const dialogs = await readDialogs(page);
  const title = await page.title().catch(() => null);
  const icons = app.kind === 'window' || app.kind === 'starter' ? await iconReport(page) : null;
  const debugLog = debugLogDelta(mark, { app: app.name });

  let shots = { light: null, dark: null };
  if (screenshots && !page.isClosed()) {
    try {
      shots = await takeScreenshots(page, shotName);
    } catch {
      // the page closed or crashed while taking the screenshots: the result has no screenshot
    }
  }

  // The collectors keep filling while we looked: take their final state.
  return {
    ...base,
    title,
    consoleLines,
    dialogs,
    icons,
    debugLog,
    pageErrors: [...collectors.pageErrors],
    consoleErrors: [...collectors.consoleErrors],
    consoleWarnings: [...collectors.consoleWarnings],
    network: [...collectors.network],
    nativeDialogs: [...collectors.nativeDialogs],
    downloads: [...collectors.downloads],
    popups: [...collectors.popups],
    screenshots: shots,
  };
}

/**
 * start + observe + classify + write. The result file is registered with the bbj fixture, so a
 * license leak found at the end of the test can be flagged on it. For kind 'dialog' the first button
 * of the first dialog is clicked afterwards so that the program can end.
 * @param {{ page: import('@playwright/test').Page, licenseFree: boolean, recordResult?: (file: string) => void }} bbj
 * @param {import('./apps.js').App} app
 * @param {{ dir?: string }} [options]
 * @returns {Promise<import('./schema.js').SampleResult>}
 */
export async function runProgram(bbj, app, { dir = 'samples' } = {}) {
  const started = await startProgram(bbj, app);
  const observed = await observe(bbj, app, started);
  const verdict = classify({ kind: app.kind, expect: app.expect, observed });
  const result = makeSampleResult({
    id: app.id,
    app: app.name,
    url: appUrl(app.name),
    kind: app.kind,
    ...verdict,
    start: observed.start,
    title: observed.title,
    dialogs: observed.dialogs,
    pageErrors: observed.pageErrors,
    consoleErrors: observed.consoleErrors,
    network: observed.network,
    icons: observed.icons,
    debugLog: observed.debugLog,
    screenshots: observed.screenshots,
    startedAt: started.startedAt,
    durationMs: Date.now() - started.t0,
  });
  const file = writeSampleResult(result, { dir });
  if (typeof bbj.recordResult === 'function') bbj.recordResult(file);

  if (app.kind === 'dialog' && bbj.licenseFree && observed.dialogs.length > 0) {
    const button = observed.dialogs[0].buttons[0];
    if (button) await clickDialogButton(bbj.page, button).catch(() => {});
  }
  return result;
}
