// Static check that every sample that needs a behaviour test has one. Pure: it reads a Playwright
// JSON report (from `playwright test --list --reporter=json`, which opens no BBj session) and the
// manifest, so check-behaviour.mjs and the unit tests share one rule.
import { ISSUES } from './manifest.js';

/** The issue numbers of Stephan's GitHub issues (3 to 7). */
export const ALL_ISSUES = Object.keys(ISSUES).map(Number);

const toPosix = (value) => String(value ?? '').replace(/\\/g, '/');

/**
 * Titles of the tests that live in a behaviour spec file (tests/behaviour/*.spec.js). Playwright
 * reports the file that calls test(), which for the behaviourTest wrapper is lib/behaviour.js, so the
 * file is read from the file suite (the top-level suite) the spec sits in.
 * @param {{ suites?: object[] }} report
 * @returns {string[]}
 */
export function behaviourTitles(report) {
  const titles = [];
  const walk = (suite, file) => {
    const here = file ?? toPosix(suite.file || suite.title);
    if (here.startsWith('behaviour/')) {
      for (const spec of suite.specs ?? []) titles.push(spec.title);
    }
    for (const child of suite.suites ?? []) walk(child, here);
  };
  for (const suite of report.suites ?? []) walk(suite, null);
  return titles;
}

/**
 * The `--issues` option: undefined means all issues, 'none' means no issue check, else a comma list.
 * @param {string|undefined} text
 * @returns {number[]}
 */
export function parseIssueList(text) {
  if (text === undefined) return [...ALL_ISSUES];
  if (text.trim().toLowerCase() === 'none') return [];
  const numbers = text.split(',').map((part) => Number(part.trim()));
  for (const n of numbers) {
    if (!ALL_ISSUES.includes(n)) throw new Error(`--issues: ${n} is not one of ${ALL_ISSUES.join(', ')}`);
  }
  return numbers;
}

/**
 * What is missing: a window or dialog entry without a test titled `[<id>] ...`, and an issue of an
 * entry (that is in the issues list) without a test titled `[<id>] issue #<n>: ...`.
 * @param {string[]} titles
 * @param {{ entries: Array<{ id: string, kind: string, issues?: number[] }> }} manifest
 * @param {{ prefix?: string, issues?: number[] }} [options] prefix limits the check to ids that start with it
 * @returns {string[]} one line per gap: `MISSING behaviour [<id>]` or `MISSING issue #<n> [<id>]`
 */
export function missingBehaviour(titles, manifest, { prefix = '', issues = ALL_ISSUES } = {}) {
  const missing = [];
  for (const entry of manifest.entries) {
    if (!entry.id.startsWith(prefix)) continue;
    if ((entry.kind === 'window' || entry.kind === 'dialog') && !titles.some((t) => t.startsWith(`[${entry.id}] `))) {
      missing.push(`MISSING behaviour [${entry.id}]`);
    }
    for (const n of entry.issues ?? []) {
      if (issues.includes(n) && !titles.some((t) => t.startsWith(`[${entry.id}] issue #${n}: `))) {
        missing.push(`MISSING issue #${n} [${entry.id}]`);
      }
    }
  }
  return missing;
}
