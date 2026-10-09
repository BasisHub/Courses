// Test wrappers for the samples project. Two kinds of test open a registered sample in DWC:
//
//   smokeTest(app)                          one per runnable sample (tests/smoke.spec.js): open it, observe
//                                           it, classify it, write results/samples/<app>.json
//   behaviourTest(id, title, opts, body)    one per behaviour check (tests/behaviour/*.spec.js): open the
//                                           sample, run the body against it, write
//                                           results/behaviour/<app>--<test>.json
//
// Both follow the same rules:
//   - Red is data. The result is written first, in a finally block, and only then does the test assert,
//     so a failing sample leaves a result file and a hanging sample too (W6).
//   - The work runs against a deadline 15 s below the test timeout. When it passes, the result is a
//     fail with category 'timeout', the last screenshot and the console text, and the test ends in time
//     for the `bbj` fixture to terminate the session (T-06.2-12).
//   - A harness problem is not a finding: an error inside the wrapper leaves a fail result with
//     harnessIssue 'wrapper-error', and the baseline runner counts it as a harness failure (W5).
//
// BehaviourResult outcomes: pass; fail (category 'assertion', 'bbj', 'timeout' or 'harness'); blocked
// (category 'license', 'start', 'console', ... when the sample did not start, or 'check' when the body
// could not make its check and threw BlockedError).
import path from 'node:path';
import { appById, appUrl } from './apps.js';
import { classify } from './classify.js';
import { consoleExcerpt, parseConsole, parseErrorText, redact } from './console.js';
import { consolePresent, readConsole, readDialogs, settle } from './dwc.js';
import { expect, test } from './fixtures.js';
import { slug } from './names.js';
import { resultsDir } from './paths.js';
import { writeBehaviourResult, writeSampleResult } from './results.js';
import { observe, runProgram, startProgram } from './run.js';
import { makeBehaviourResult, makeSampleResult } from './schema.js';

/** Each step of the evidence taken after a deadline (screenshot, console) may take this long. */
const EVIDENCE_STEP_MS = 5000;
/** Evidence strings are cut here so that one bad page cannot flood a result file. */
const EVIDENCE_MAX = 700;
/** Wait after the body for a program that crashes in response to the last action. */
const POST_BODY_SETTLE_MS = 1500;

/**
 * Throw this from a behaviour body when the check cannot be made, for example because the oracle
 * element the check compares against is missing. The outcome is 'blocked' with category 'check' and
 * the message as evidence.
 */
export class BlockedError extends Error {
  /** @param {string} reason */
  constructor(reason) {
    super(reason);
    this.name = 'BlockedError';
  }
}

/**
 * Races fn() against a timer. A rejection of fn that arrives after the deadline is caught and
 * ignored, so it can never surface as an unhandled rejection. The timer is always cleared.
 * @template T
 * @param {number} ms
 * @param {() => Promise<T>|T} fn
 * @returns {Promise<{ timedOut: true }|{ timedOut: false, value: T }|{ timedOut: false, error: unknown }>}
 */
export async function withDeadline(ms, fn) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve({ timedOut: true }), ms);
  });
  const work = Promise.resolve()
    .then(fn)
    .then(
      (value) => ({ timedOut: false, value }),
      (error) => ({ timedOut: false, error }),
    );
  try {
    return await Promise.race([work, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The time a test body gets, in ms: the test timeout minus a margin (default 15 s), at least 5 s. The
 * `bbj` fixture has its own 90 s timeout, so its setup does not count against the test timeout.
 * @param {{ timeout: number }} testInfo
 * @param {number} [marginMs]
 */
export function deadlineFor(testInfo, marginMs = 15000) {
  return Math.max(5000, testInfo.timeout - marginMs);
}

/** Cuts text to max characters; a cut ends in three dots. */
function clip(text, max = EVIDENCE_MAX) {
  const value = String(text);
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

// Playwright colours its error messages when the terminal does.
const ANSI = /\x1b\[[0-9;]*m/g;

/** The first non-empty line of an error message, without colour codes. */
export function firstLine(error) {
  const text = String((error && error.message !== undefined ? error.message : error) ?? '').replace(ANSI, '');
  return (
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line !== '') ?? 'unknown error'
  );
}

/**
 * First line of an assertion error plus the Locator, Expected and Received lines Playwright adds
 * below it, so that a report row says what was looked for and what was found.
 */
export function describeFailure(error) {
  const text = String((error && error.message !== undefined ? error.message : error) ?? '').replace(ANSI, '');
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');
  const details = lines
    .slice(1)
    .filter((line) => /^(Locator|Expected|Received)\b/.test(line))
    .slice(0, 3)
    .map((line) => clip(line, 120));
  return clip([lines[0] ?? 'unknown error', ...details].join('; '));
}

/** '!ERROR=<code> <message> at line <line>' */
export function describeBbjError(error) {
  let text = `!ERROR=${error.code}`;
  if (error.message) text += ` ${error.message}`;
  if (error.line !== null && error.line !== undefined) text += ` at line ${error.line}`;
  return text;
}

/** The state a sample of this kind has to be in once it started. */
export function expectedStartState(kind) {
  if (kind === 'print') return 'console';
  if (kind === 'dialog') return 'dialog';
  return 'window';
}

/**
 * 'timed out after <s> s; last note: <text>; console: <lines joined by " / ">'. Without a lastNote
 * argument (undefined) the note part is left out.
 */
export function timeoutText(ms, excerpt, lastNote) {
  const parts = [`timed out after ${Math.round(ms / 1000)} s`];
  if (lastNote !== undefined) parts.push(`last note: ${lastNote ?? 'none'}`);
  parts.push(`console: ${excerpt && excerpt.length > 0 ? excerpt.join(' / ') : 'none'}`);
  return parts.join('; ');
}

/**
 * The verdict of a body that ran. A BBj error in the console wins over everything else: it is the
 * cause, and the assertion that failed (if any) is only a symptom.
 * @param {{ bodyError: unknown, bbjErrors: Array<{ code: number, message: string, line: number|null }> }} input
 * @returns {{ outcome: 'pass'|'fail'|'blocked', category: string|null, evidence: string|null }}
 */
export function judge({ bodyError, bbjErrors }) {
  let verdict;
  if (bodyError === null || bodyError === undefined) {
    verdict = { outcome: 'pass', category: null, evidence: null };
  } else if (bodyError instanceof BlockedError) {
    verdict = { outcome: 'blocked', category: 'check', evidence: bodyError.message };
  } else {
    verdict = { outcome: 'fail', category: 'assertion', evidence: `failed: ${describeFailure(bodyError)}` };
  }
  if (bbjErrors.length > 0) {
    let evidence = describeBbjError(bbjErrors[0]);
    if (bbjErrors.length > 1) evidence += ` (+${bbjErrors.length - 1} more)`;
    if (verdict.evidence) evidence += `; body: ${verdict.evidence}`;
    verdict = { outcome: 'fail', category: 'bbj', evidence };
  }
  return verdict;
}

/** Adds the notes a body wrote to its evidence (a pass keeps them as its only evidence). */
function withNotes(verdict, notes) {
  if (notes.length === 0) return verdict;
  const text = notes.join(' / ');
  return { ...verdict, evidence: verdict.evidence ? `${verdict.evidence}; notes: ${text}` : text };
}

function safeFileBase(base) {
  return String(base).replace(/[^A-Za-z0-9._-]+/g, '-');
}

/**
 * Evidence for a test that hit its deadline: a screenshot into results/screenshots/<base>-timeout.png
 * and the console text, each step capped at 5 s so that a frozen page cannot hold the test past its
 * timeout. The screenshot can show the console header (license serial number): it stays in results/.
 * @param {import('@playwright/test').Page} page
 * @param {string} base file name stem
 * @returns {Promise<{ screenshot: string|null, excerpt: string[] }>} screenshot is relative to resultsDir()
 */
export async function timeoutEvidence(page, base) {
  const name = `${safeFileBase(base)}-timeout.png`;
  let screenshot = null;
  const shot = await withDeadline(EVIDENCE_STEP_MS, () =>
    page.screenshot({ path: path.join(resultsDir('screenshots'), name), timeout: EVIDENCE_STEP_MS }),
  );
  if (!shot.timedOut && !('error' in shot)) screenshot = `screenshots/${name}`;

  let excerpt = [];
  const read = await withDeadline(EVIDENCE_STEP_MS, () => readConsole(page, { waitForReadyMs: 0 }));
  if (!read.timedOut && !('error' in read) && Array.isArray(read.value)) {
    excerpt = consoleExcerpt(parseConsole(read.value)).map(redact);
  }
  return { screenshot, excerpt };
}

/** BBj errors in the console (and in error dialogs) after a body ran. */
async function readBbjErrors(page) {
  await settle(page, POST_BODY_SETTLE_MS).catch(() => {});
  const errors = [];
  if (await consolePresent(page)) {
    const lines = await readConsole(page, { waitForReadyMs: 2000 });
    if (Array.isArray(lines)) errors.push(...parseConsole(lines).errors);
  }
  for (const dialog of await readDialogs(page)) errors.push(...parseErrorText(dialog.text));
  return errors;
}

/** Light screenshot after a body, relative to resultsDir(); null when it cannot be taken. */
async function shoot(page, base) {
  if (page.isClosed()) return null;
  const name = `${safeFileBase(base)}.png`;
  try {
    await page.screenshot({ path: path.join(resultsDir('screenshots'), name), timeout: EVIDENCE_STEP_MS });
    return `screenshots/${name}`;
  } catch {
    return null;
  }
}

/**
 * Opens a registered sample in DWC and runs a check against it. The test is titled
 * `[<id>] issue #<n>: <title>` when opts.issue is set, else `[<id>] <title>`, and asserts that the
 * outcome is 'pass'; a failing or blocked check is a finding, recorded in
 * results/behaviour (results/selftest-behaviour for fixture ids).
 *
 *   behaviourTest('dwc/01_GUI2BUI2DWC/DWC2.bbj', 'speaker icon renders', { issue: 4 }, async ({ page, app, note }) => {
 *     await expect(page.getByRole('button', { name: 'Say Hello' })).toBeVisible();
 *     note('button found by role and name');
 *   });
 *
 * @param {string} id manifest id, or `fixture/<file>` for a control program
 * @param {string} title short test name; two tests on one sample need titles that differ within 40 characters
 * @param {{ issue?: number, startDialog?: { button: string }|null, expectFailure?: boolean, deadlineMs?: number }} [opts]
 *   startDialog: answer a dialog the program asks first (default: expect.startDialog of the manifest
 *   entry, null for none). expectFailure: the test is expected to be red (wrapper self-tests only).
 *   deadlineMs: replaces the deadline (wrapper self-test only).
 * @param {(ctx: { page: import('@playwright/test').Page, app: import('./apps.js').App, note: (text: string) => void }) => Promise<void>} body
 *   Use Playwright's expect; a thrown error is a fail. note(text) adds evidence. Throw BlockedError
 *   when the check cannot be made.
 */
export function behaviourTest(id, title, opts, body) {
  if (typeof opts === 'function') {
    body = opts;
    opts = {};
  }
  const options = opts ?? {};
  if (typeof id !== 'string' || id === '') throw new TypeError('behaviourTest needs a sample id');
  if (typeof title !== 'string' || title === '') throw new TypeError(`behaviourTest [${id}] needs a title`);
  if (typeof body !== 'function') throw new TypeError(`behaviourTest [${id}] ${title}: the body must be a function`);
  const issue = options.issue ?? null;
  if (issue !== null && !Number.isInteger(issue)) {
    throw new TypeError(`behaviourTest [${id}] ${title}: issue must be an integer`);
  }
  const fullTitle = issue === null ? `[${id}] ${title}` : `[${id}] issue #${issue}: ${title}`;
  const dir = id.startsWith('fixture/') ? 'selftest-behaviour' : 'behaviour';

  test(fullTitle, async ({ bbj }) => {
    if (options.expectFailure) test.fail();
    const startedAt = new Date().toISOString();
    const notes = [];
    const note = (text) => {
      notes.push(clip(redact(String(text)), 200));
    };
    let app = null;
    let result = null;
    try {
      app = appById(id);
      const base = `${app.name}--${slug(title).slice(0, 40).replace(/-+$/, '')}`;
      const ms = options.deadlineMs ?? deadlineFor(bbj.testInfo);

      const run = await withDeadline(ms, async () => {
        let started;
        try {
          started = await startProgram(bbj, app, { startDialog: options.startDialog });
        } catch (error) {
          return { outcome: 'blocked', category: 'start', evidence: `sample did not start (error): ${firstLine(error)}`, screenshot: null };
        }

        const want = expectedStartState(app.kind);
        if (started.start.state !== want) {
          const observed = await observe(bbj, app, started, { screenshots: false });
          const { reasons } = classify({ kind: app.kind, expect: app.expect, observed });
          const why = reasons.map((r) => `${r.category}: ${r.detail}`).join('; ') || 'no reason recorded';
          return {
            outcome: 'blocked',
            category: reasons[0] ? reasons[0].category : 'start',
            evidence: `sample did not start (${started.start.state}): ${why}`,
            screenshot: bbj.licenseFree ? await shoot(bbj.page, base) : null,
          };
        }

        let bodyError = null;
        try {
          await body({ page: bbj.page, app, note });
        } catch (error) {
          bodyError = error;
        }
        const bbjErrors = await readBbjErrors(bbj.page);
        const verdict = withNotes(judge({ bodyError, bbjErrors }), notes);
        return { ...verdict, screenshot: await shoot(bbj.page, base) };
      });

      let verdict;
      if (run.timedOut) {
        const found = await timeoutEvidence(bbj.page, base);
        verdict = {
          outcome: 'fail',
          category: 'timeout',
          evidence: timeoutText(ms, found.excerpt, notes.length > 0 ? notes[notes.length - 1] : null),
          screenshot: found.screenshot,
        };
      } else if ('error' in run) {
        throw run.error;
      } else {
        verdict = run.value;
      }
      result = makeBehaviourResult({
        id,
        app: app.name,
        test: title,
        issue,
        outcome: verdict.outcome,
        category: verdict.category,
        evidence: verdict.evidence === null ? null : clip(redact(verdict.evidence)),
        screenshot: verdict.screenshot,
        startedAt,
      });
    } catch (error) {
      result = makeBehaviourResult({
        id,
        app: app ? app.name : slug(id),
        test: title,
        issue,
        outcome: 'fail',
        category: 'harness',
        evidence: clip(redact(`wrapper error: ${firstLine(error)}`)),
        startedAt,
        harnessIssue: 'wrapper-error',
      });
    } finally {
      // Written before the assertion, so a red test, a timeout and a wrapper error all leave a file.
      if (result !== null) bbj.recordResult(writeBehaviourResult(result, { dir }));
    }

    expect(result.outcome, `${result.category}: ${result.evidence}`).toBe('pass');
  });
}

/**
 * Defines `smoke [<id>]`: opens the sample, observes and classifies it (runProgram) and asserts that
 * the status is 'pass'. A red status is a finding, not a harness failure.
 * @param {import('./apps.js').App} app
 */
export function smokeTest(app) {
  test(`smoke [${app.id}]`, async ({ bbj }) => {
    const startedAt = new Date().toISOString();
    const t0 = Date.now();
    const ms = deadlineFor(bbj.testInfo);
    const identity = { id: app.id, app: app.name, url: appUrl(app.name), kind: app.kind, startedAt };
    let result = null;
    let written = false; // runProgram writes and registers its own result
    try {
      const run = await withDeadline(ms, () => runProgram(bbj, app));
      if (run.timedOut) {
        const found = await timeoutEvidence(bbj.page, app.name);
        result = makeSampleResult({
          ...identity,
          status: 'fail',
          reasons: [{ category: 'timeout', detail: clip(redact(timeoutText(ms, found.excerpt))) }],
          consoleExcerpt: found.excerpt,
          screenshots: { light: found.screenshot, dark: null },
          durationMs: Date.now() - t0,
        });
      } else if ('error' in run) {
        result = makeSampleResult({
          ...identity,
          status: 'fail',
          reasons: [{ category: 'start', detail: clip(redact(`error: ${firstLine(run.error)}`)) }],
          durationMs: Date.now() - t0,
        });
      } else {
        result = run.value;
        written = true;
      }
    } catch (error) {
      result = makeSampleResult({
        ...identity,
        status: 'fail',
        reasons: [{ category: 'start', detail: clip(redact(`wrapper error: ${firstLine(error)}`)) }],
        durationMs: Date.now() - t0,
        harnessIssue: 'wrapper-error',
      });
    } finally {
      if (result !== null && !written) bbj.recordResult(writeSampleResult(result));
    }

    const why = result.reasons.map((r) => `${r.category}: ${r.detail}`).join('\n');
    expect(result.status, why).toBe('pass');
  });
}
