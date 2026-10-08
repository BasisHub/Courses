// Result contracts for the sample test harness. Every later plan imports the
// constants and factories from here; no other module defines a result shape.

/** Verdicts a sample result can carry. */
export const STATUSES = ['pass', 'fail', 'blocked'];

/**
 * Why a sample failed or was blocked. 'timeout' is set by the test wrappers
 * when a test body hits its deadline, never by classify.
 */
export const CATEGORIES = [
  'license',
  'start',
  'timeout',
  'bbj',
  'console',
  'page',
  'console-error',
  'network-local',
  'network-external',
  'icons',
  'print',
  'dialog',
];

/** Findings that are recorded but do not fail a sample. */
export const WARNING_CATEGORIES = ['title', 'console-output', 'console-warning', 'debug-log'];

/**
 * @typedef {{ category: string, detail: string }} Finding
 * @typedef {{ code: number, message: string, line: number|null, statement: string|null }} BbjError
 * @typedef {{ title: string, text: string }} DialogObservation
 * @typedef {{ url: string, status: number|null, error: string|null, external: boolean }} NetworkObservation
 * @typedef {{ pool: string|null, name: string|null }} MissingIcon
 * @typedef {{ total: number, rendered: number, missing: MissingIcon[] }} IconObservation
 * @typedef {{ file: string|null, newLines: number, errorLines: number }} DebugLogObservation
 * @typedef {{ id: string, program: string }} Leak
 *
 * What a browser saw while a sample ran.
 * @typedef {object} Observed
 * @property {{ state: 'window'|'console'|'dialog'|'timeout'|'license', ms: number }} start
 * @property {string|null} title
 * @property {string[]|null} consoleLines null when no console frame appeared
 * @property {DialogObservation[]} dialogs
 * @property {string[]} pageErrors
 * @property {string[]} consoleErrors
 * @property {string[]} consoleWarnings
 * @property {NetworkObservation[]} network
 * @property {IconObservation|null} icons
 * @property {DebugLogObservation|null} debugLog
 *
 * One row of the baseline: the verdict for one sample program.
 * @typedef {object} SampleResult
 * @property {1} schema
 * @property {string} id
 * @property {string|null} app
 * @property {string|null} url
 * @property {string|null} kind
 * @property {'pass'|'fail'|'blocked'} status
 * @property {Finding[]} reasons
 * @property {Finding[]} warnings
 * @property {Observed['start']} start
 * @property {string|null} title
 * @property {BbjError[]} bbjErrors
 * @property {string[]} printed
 * @property {string[]} consoleExcerpt
 * @property {string|null} bbjVersion
 * @property {DialogObservation[]} dialogs
 * @property {string[]} pageErrors
 * @property {string[]} consoleErrors
 * @property {NetworkObservation[]} network
 * @property {IconObservation|null} icons
 * @property {DebugLogObservation|null} debugLog
 * @property {{ light: string|null, dark: string|null }} screenshots
 * @property {string|null} startedAt
 * @property {number} durationMs
 * @property {string|null} harnessIssue for example 'license-leak'; set by the bbj fixture
 * @property {Leak[]} leaked license leaks found while the sample ran
 *
 * The verdict of one behaviour test.
 * @typedef {object} BehaviourResult
 * @property {1} schema
 * @property {string} id
 * @property {string|null} app
 * @property {string|null} test
 * @property {number|null} issue
 * @property {'pass'|'fail'|'blocked'} outcome
 * @property {string|null} category null for pass, else 'license', 'start', 'bbj', 'timeout', 'assertion', 'check' or 'harness'
 * @property {string|null} evidence
 * @property {string|null} screenshot
 * @property {string|null} startedAt
 * @property {string|null} harnessIssue
 * @property {Leak[]} leaked
 *
 * results/compile.json
 * @typedef {object} CompileResult
 * @property {1} schema
 * @property {string|null} compiler
 * @property {string|null} generatedAt
 * @property {Array<{ id: string, syntax: { ok: boolean, messages: string[] }, typecheck: { errors: number, warnings: number, undeclared: number, findings: Array<{ line: number, severity: 'error'|'warning', message: string, statement: string }> } }>} files
 *
 * results/baseline.json
 * @typedef {object} Baseline
 * @property {1} schema
 * @property {string|null} startedAt
 * @property {string|null} finishedAt
 * @property {{ selftest: number|null, samples: number|null }} playwright
 * @property {string[]} harnessFailures
 * @property {{ playwright: string|null, chromium: string|null, bbj: string|null }} versions
 */

/** @returns {Observed} an observation with nothing seen yet */
export function emptyObserved() {
  return {
    start: { state: 'timeout', ms: 0 },
    title: null,
    consoleLines: null,
    dialogs: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    network: [],
    icons: null,
    debugLog: null,
  };
}

function pick(fields, key, fallback) {
  return fields !== undefined && fields !== null && fields[key] !== undefined ? fields[key] : fallback;
}

function requireValue(name, value) {
  if (!STATUSES.includes(value)) {
    throw new Error(`${name} must be one of ${STATUSES.join(', ')}; got ${JSON.stringify(value)}`);
  }
  return value;
}

/**
 * Builds a SampleResult. Known keys are copied from fields, missing keys get
 * the documented defaults, unknown keys are dropped. status is required.
 * @param {Partial<SampleResult>} fields
 * @returns {SampleResult}
 */
export function makeSampleResult(fields = {}) {
  return {
    schema: 1,
    id: pick(fields, 'id', null),
    app: pick(fields, 'app', null),
    url: pick(fields, 'url', null),
    kind: pick(fields, 'kind', null),
    status: requireValue('status', fields?.status),
    reasons: pick(fields, 'reasons', []),
    warnings: pick(fields, 'warnings', []),
    start: pick(fields, 'start', emptyObserved().start),
    title: pick(fields, 'title', null),
    bbjErrors: pick(fields, 'bbjErrors', []),
    printed: pick(fields, 'printed', []),
    consoleExcerpt: pick(fields, 'consoleExcerpt', []),
    bbjVersion: pick(fields, 'bbjVersion', null),
    dialogs: pick(fields, 'dialogs', []),
    pageErrors: pick(fields, 'pageErrors', []),
    consoleErrors: pick(fields, 'consoleErrors', []),
    network: pick(fields, 'network', []),
    icons: pick(fields, 'icons', null),
    debugLog: pick(fields, 'debugLog', null),
    screenshots: { light: null, dark: null, ...pick(fields, 'screenshots', {}) },
    startedAt: pick(fields, 'startedAt', null),
    durationMs: pick(fields, 'durationMs', 0),
    harnessIssue: pick(fields, 'harnessIssue', null),
    leaked: pick(fields, 'leaked', []),
  };
}

/**
 * Builds a BehaviourResult. outcome is required and must be one of STATUSES.
 * @param {Partial<BehaviourResult>} fields
 * @returns {BehaviourResult}
 */
export function makeBehaviourResult(fields = {}) {
  return {
    schema: 1,
    id: pick(fields, 'id', null),
    app: pick(fields, 'app', null),
    test: pick(fields, 'test', null),
    issue: pick(fields, 'issue', null),
    outcome: requireValue('outcome', fields?.outcome),
    category: pick(fields, 'category', null),
    evidence: pick(fields, 'evidence', null),
    screenshot: pick(fields, 'screenshot', null),
    startedAt: pick(fields, 'startedAt', null),
    harnessIssue: pick(fields, 'harnessIssue', null),
    leaked: pick(fields, 'leaked', []),
  };
}

/**
 * Builds a CompileResult.
 * @param {Partial<CompileResult>} fields
 * @returns {CompileResult}
 */
export function makeCompileResult(fields = {}) {
  return {
    schema: 1,
    compiler: pick(fields, 'compiler', null),
    generatedAt: pick(fields, 'generatedAt', null),
    files: pick(fields, 'files', []),
  };
}

/**
 * Builds a Baseline.
 * @param {Partial<Baseline>} fields
 * @returns {Baseline}
 */
export function makeBaseline(fields = {}) {
  return {
    schema: 1,
    startedAt: pick(fields, 'startedAt', null),
    finishedAt: pick(fields, 'finishedAt', null),
    playwright: { selftest: null, samples: null, ...pick(fields, 'playwright', {}) },
    harnessFailures: pick(fields, 'harnessFailures', []),
    versions: { playwright: null, chromium: null, bbj: null, ...pick(fields, 'versions', {}) },
  };
}
