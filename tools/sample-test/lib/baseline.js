// The rules of the baseline runner (run-baseline.mjs) that decide what is a harness failure. Pure: they
// take parsed result files, so the unit tests prove them without BBj.
//
// A sample that is red is a finding and never a failure here. A failure means the harness did not do its
// job: a sample has no result, a test was blocked by a license problem, a result carries a harness issue
// (license-leak, wrapper-error), or something was left behind. A test that ran into its deadline is a
// finding (category 'timeout').

/** True when the result was written during this run (startedAt is at or after the run's start). */
export function isFresh(result, startedAtMs) {
  const at = Date.parse(result && result.startedAt);
  return Number.isFinite(at) && at >= startedAtMs;
}

const isBehaviour = (result) => Object.hasOwn(result, 'outcome');

/**
 * Gaps in a complete run: a runnable sample without a fresh smoke result, a window or dialog entry
 * without a behaviour result, an issue of an entry without a behaviour result carrying that issue.
 * @param {{ apps: Array<{ id: string, name: string }>, manifest: { entries: Array<{ id: string, kind: string, issues?: number[] }> }, samples: object[], behaviour: object[], startedAt: string }} input
 * @returns {string[]} one line per gap
 */
export function completenessFailures({ apps, manifest, samples, behaviour, startedAt }) {
  const since = Date.parse(startedAt);
  const failures = [];
  const smokeByApp = new Map(samples.map((r) => [r.app, r]));
  for (const app of apps) {
    const result = smokeByApp.get(app.name);
    if (!result) failures.push(`smoke result missing for ${app.id}`);
    else if (!isFresh(result, since)) failures.push(`smoke result for ${app.id} is older than this run`);
  }
  const fresh = behaviour.filter((r) => isFresh(r, since));
  for (const entry of manifest.entries) {
    if ((entry.kind === 'window' || entry.kind === 'dialog') && !fresh.some((r) => r.id === entry.id)) {
      failures.push(`behaviour result missing for ${entry.id}`);
    }
    for (const n of entry.issues ?? []) {
      if (!fresh.some((r) => r.id === entry.id && r.issue === n)) {
        failures.push(`behaviour result missing for issue #${n} of ${entry.id}`);
      }
    }
  }
  return failures;
}

function issueDetail(result) {
  const leaked = (result.leaked ?? []).map((l) => `${l.id} ${l.program}`);
  if (leaked.length > 0) return leaked.join(', ');
  if (isBehaviour(result)) return result.evidence ?? '';
  const reason = (result.reasons ?? [])[0];
  return reason ? `${reason.category}: ${reason.detail}` : '';
}

/**
 * Results of this run that show a problem of the harness, not of a sample (W5): a harnessIssue
 * (license-leak, wrapper-error) or a block by license. One line per result.
 * @param {{ samples?: object[], selftest?: object[], behaviour?: object[], selftestBehaviour?: object[] }} groups
 * @param {string} startedAt ISO time of the run start
 * @returns {string[]}
 */
export function harnessIssueFailures(groups, startedAt) {
  const since = Date.parse(startedAt);
  const labels = [
    ['samples', () => 'smoke'],
    ['selftest', () => 'self-test control'],
    ['behaviour', (r) => r.test ?? 'behaviour'],
    ['selftestBehaviour', (r) => r.test ?? 'wrapper self-test'],
  ];
  const failures = [];
  for (const [key, labelOf] of labels) {
    for (const result of groups[key] ?? []) {
      if (!isFresh(result, since)) continue;
      const blockedByLicense = isBehaviour(result)
        ? result.category === 'license'
        : (result.reasons ?? []).some((r) => r.category === 'license');
      if (!result.harnessIssue && !blockedByLicense) continue;
      const kind = result.harnessIssue || 'blocked by license';
      const detail = issueDetail(result);
      failures.push(`harness issue ${kind} in ${result.app ?? result.id} [${labelOf(result)}]${detail ? `: ${detail}` : ''}`);
    }
  }
  return failures;
}

/**
 * Counts for the console summary: smoke results by status, the reason categories of the samples that
 * are not green (a sample counts once per category it has), behaviour results by outcome.
 * @param {{ samples: object[], behaviour: object[] }} input
 */
export function summarize({ samples, behaviour }) {
  const count = (list, key, values) => Object.fromEntries(values.map((v) => [v, list.filter((r) => r[key] === v).length]));
  const categories = {};
  for (const result of samples) {
    for (const category of new Set((result.reasons ?? []).map((r) => r.category))) {
      categories[category] = (categories[category] ?? 0) + 1;
    }
  }
  return {
    smoke: { total: samples.length, ...count(samples, 'status', ['pass', 'fail', 'blocked']) },
    smokeCategories: Object.fromEntries(Object.entries(categories).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
    behaviour: { total: behaviour.length, ...count(behaviour, 'outcome', ['pass', 'fail', 'blocked']) },
  };
}

/**
 * Reads the verdict of a Playwright JSON report (`--reporter=json`) for the samples run. Red tests are
 * findings and not looked at here; what counts is whether the run happened at all.
 * @param {object|null} report parsed JSON, or null when the file was missing or unreadable
 * @returns {string[]} harness failures
 */
export function samplesRunFailures(report) {
  if (!report || typeof report !== 'object') return ['samples run left no Playwright report'];
  const failures = [];
  const errors = Array.isArray(report.errors) ? report.errors : [];
  if (errors.length > 0) {
    const first = String(errors[0].message ?? 'unknown error')
      .replace(/\x1b\[[0-9;]*m/g, '')
      .split(/\r?\n/)
      .find((line) => line.trim() !== '');
    failures.push(`samples run reported ${errors.length} error(s): ${first ?? 'unknown error'}`);
  }
  const stats = report.stats ?? {};
  const ran = (stats.expected ?? 0) + (stats.unexpected ?? 0) + (stats.flaky ?? 0);
  if (ran === 0) failures.push('samples run executed no tests');
  return failures;
}
