// Turns what a browser observed while a sample ran into a verdict. Pure: no
// browser, no BBj, no file access, so the rules are proven by unit tests.

import { emptyObserved } from './schema.js';
import { consoleExcerpt, parseConsole, parseErrorText, redact } from './console.js';

/**
 * Known noise that is not a finding. Plan 08 adds an entry only for noise the
 * known-good control program shows, each with a comment saying why.
 */
export const IGNORED = { consoleErrors: [], pageErrors: [], network: [] };

// Class entries are documentation only and never run.
const KINDS = ['window', 'starter', 'print', 'dialog'];

function ignored(list, text) {
  return list.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}

function oneLine(text) {
  return redact(String(text ?? '')).replace(/\s+/g, ' ').trim();
}

function describeDialogExpectation(want) {
  let text = 'a dialog';
  if (want.title !== undefined) text += ` titled "${want.title}"`;
  if (want.text !== undefined) text += ` containing "${want.text}"`;
  return text;
}

/**
 * @param {{ kind: string, expect?: object, observed: import('./schema.js').Observed }} input
 * @returns {{
 *   status: 'pass'|'fail'|'blocked',
 *   reasons: Array<{ category: string, detail: string }>,
 *   warnings: Array<{ category: string, detail: string }>,
 *   bbjErrors: import('./console.js').BbjError[],
 *   printed: string[],
 *   consoleExcerpt: string[],
 *   bbjVersion: string|null
 * }}
 */
export function classify({ kind, expect = {}, observed }) {
  if (!KINDS.includes(kind)) {
    throw new Error(`classify: unknown kind ${JSON.stringify(kind)}; expected one of ${KINDS.join(', ')}`);
  }
  const want = expect ?? {};
  const obs = { ...emptyObserved(), ...observed };
  const state = obs.start?.state;
  const dialogs = obs.dialogs ?? [];
  const parsed = Array.isArray(obs.consoleLines) ? parseConsole(obs.consoleLines) : null;

  // 1. BBj errors from the console and from dialogs.
  const bbjErrors = [...(parsed?.errors ?? [])];
  const unreadableErrorDialogs = [];
  const breakDialogs = [];
  for (const dialog of dialogs) {
    const text = dialog.text ?? '';
    const found = parseErrorText(text);
    bbjErrors.push(...found);
    if (/break to console/i.test(text)) {
      breakDialogs.push(dialog);
    } else if (found.length === 0 && String(dialog.title ?? '').trim().toLowerCase() === 'error') {
      unreadableErrorDialogs.push(dialog);
    }
  }

  const common = {
    bbjErrors,
    printed: parsed?.printed ?? [],
    consoleExcerpt: consoleExcerpt(parsed),
    bbjVersion: parsed?.bbjVersion ?? null,
  };

  // 2. Blocked: the server had no license, the program was never judged.
  const licenseDialog = dialogs.find(
    (d) => /E3008|out of licenses/i.test(d.text ?? '') || /^license error/i.test(String(d.title ?? '').trim()),
  );
  if (state === 'license' || licenseDialog) {
    const detail = licenseDialog
      ? oneLine(`${licenseDialog.title}: ${licenseDialog.text}`)
      : 'DWC reported a license problem before the program started';
    return { status: 'blocked', reasons: [{ category: 'license', detail }], warnings: [], ...common };
  }

  // 3. Reasons (fail) and warnings (recorded only).
  const reasons = [];
  const warnings = [];

  for (const error of bbjErrors) {
    let detail = `!ERROR=${error.code}${error.message ? ` ${error.message}` : ''}`;
    if (error.line != null) detail += ` at line ${error.line}: ${error.statement}`;
    reasons.push({ category: 'bbj', detail });
  }
  for (const dialog of unreadableErrorDialogs) {
    reasons.push({ category: 'bbj', detail: `Error dialog: ${oneLine(dialog.text)}` });
  }
  for (const dialog of breakDialogs) {
    reasons.push({ category: 'console', detail: oneLine(dialog.text) });
  }

  if (state === 'timeout') {
    reasons.push({ category: 'start', detail: 'no window, console or dialog within the start timeout' });
  }

  if (kind === 'window' || kind === 'starter') {
    if (state !== 'window' && state !== 'timeout') {
      reasons.push({ category: 'start', detail: `expected a window, got ${state}` });
    }
    if (parsed) {
      if (parsed.ready && bbjErrors.length === 0) {
        reasons.push({ category: 'console', detail: 'program ended and returned to READY' });
      } else if (!parsed.ready) {
        warnings.push({ category: 'console-output', detail: parsed.printed.join(' / ') });
      }
    }
    if (typeof want.title === 'string' && obs.title !== want.title) {
      const got = obs.title === null ? 'no title' : `"${obs.title}"`;
      warnings.push({ category: 'title', detail: `expected "${want.title}", got ${got}` });
    }
  } else if (kind === 'print') {
    if (state !== 'console' && state !== 'timeout') {
      reasons.push({ category: 'start', detail: `expected the console, got ${state}` });
    }
    const printed = parsed?.printed ?? [];
    for (const text of want.print ?? []) {
      if (!printed.some((line) => line.includes(text))) {
        reasons.push({ category: 'print', detail: `missing printed text: ${text}` });
      }
    }
  } else if (kind === 'dialog') {
    const expectedDialog = want.dialog ?? {};
    const match = dialogs.find(
      (d) =>
        (expectedDialog.title === undefined || d.title === expectedDialog.title) &&
        (expectedDialog.text === undefined || String(d.text ?? '').includes(expectedDialog.text)),
    );
    if (!match) {
      const seen = dialogs.length === 0 ? 'none' : dialogs.map((d) => `"${d.title}"`).join(', ');
      reasons.push({
        category: 'dialog',
        detail: `expected ${describeDialogExpectation(expectedDialog)}; dialogs seen: ${seen}`,
      });
    }
  }

  // Findings that apply to every kind.
  for (const text of obs.pageErrors ?? []) {
    if (!ignored(IGNORED.pageErrors, text)) reasons.push({ category: 'page', detail: text });
  }
  for (const text of obs.consoleErrors ?? []) {
    if (!ignored(IGNORED.consoleErrors, text)) reasons.push({ category: 'console-error', detail: text });
  }
  for (const text of obs.consoleWarnings ?? []) {
    warnings.push({ category: 'console-warning', detail: text });
  }
  // A network entry is a problem when the request failed or answered 4xx/5xx;
  // a 2xx or 3xx entry is not.
  for (const entry of obs.network ?? []) {
    const failed = entry.error != null || (typeof entry.status === 'number' && entry.status >= 400);
    if (!failed || ignored(IGNORED.network, entry.url)) continue;
    reasons.push({
      category: entry.external ? 'network-external' : 'network-local',
      detail: `${entry.status ?? entry.error} ${entry.url}`,
    });
  }
  if (obs.icons && Array.isArray(obs.icons.missing) && obs.icons.missing.length > 0) {
    const missing = obs.icons.missing.map((icon) => `${icon.pool ?? '?'}:${icon.name ?? '?'}`).join(', ');
    reasons.push({
      category: 'icons',
      detail: `${obs.icons.rendered}/${obs.icons.total} icons rendered; missing ${missing}`,
    });
  }
  if (obs.debugLog && obs.debugLog.errorLines > 0) {
    warnings.push({
      category: 'debug-log',
      detail: `${obs.debugLog.errorLines} error lines in ${obs.debugLog.file ?? 'Debug.log'}`,
    });
  }

  // 4. Verdict.
  return { status: reasons.length > 0 ? 'fail' : 'pass', reasons, warnings, ...common };
}
