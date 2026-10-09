import test from 'node:test';
import assert from 'node:assert/strict';
import { completenessFailures, harnessIssueFailures, isFresh, samplesRunFailures, summarize } from './baseline.js';

const START = '2026-10-09T10:00:00.000Z';
const LATER = '2026-10-09T10:05:00.000Z';
const EARLIER = '2026-10-09T09:00:00.000Z';

const apps = [
  { id: 'dwc/a/One.bbj', name: 'courses-dwc-a-one' },
  { id: 'dwc/a/Two.bbj', name: 'courses-dwc-a-two' },
];
const manifest = {
  entries: [
    { id: 'dwc/a/One.bbj', kind: 'window', issues: [4] },
    { id: 'dwc/a/Two.bbj', kind: 'print', issues: [] },
    { id: 'dwc/a/Three.bbj', kind: 'class', issues: [] },
    { id: 'dwc/a/Four.bbj', kind: 'dialog', issues: [] },
  ],
};
const smoke = (app, extra = {}) => ({ app, status: 'pass', reasons: [], startedAt: LATER, harnessIssue: null, leaked: [], ...extra });
const behaviour = (id, extra = {}) => ({ id, app: 'x', test: 't', issue: null, outcome: 'pass', category: null, evidence: null, startedAt: LATER, harnessIssue: null, leaked: [], ...extra });

test('isFresh compares the start time of a result with the start of the run', () => {
  const since = Date.parse(START);
  assert.equal(isFresh({ startedAt: LATER }, since), true);
  assert.equal(isFresh({ startedAt: START }, since), true);
  assert.equal(isFresh({ startedAt: EARLIER }, since), false);
  assert.equal(isFresh({ startedAt: null }, since), false);
  assert.equal(isFresh(undefined, since), false);
});

test('completenessFailures is empty for a complete run', () => {
  const failures = completenessFailures({
    apps,
    manifest,
    samples: [smoke('courses-dwc-a-one'), smoke('courses-dwc-a-two')],
    behaviour: [behaviour('dwc/a/One.bbj', { issue: 4 }), behaviour('dwc/a/Four.bbj')],
    startedAt: START,
  });
  assert.deepEqual(failures, []);
});

test('completenessFailures names every gap: missing and stale smoke results, missing behaviour and issue results', () => {
  const failures = completenessFailures({
    apps,
    manifest,
    samples: [smoke('courses-dwc-a-one', { startedAt: EARLIER })],
    behaviour: [behaviour('dwc/a/One.bbj')],
    startedAt: START,
  });
  assert.deepEqual(failures, [
    'smoke result for dwc/a/One.bbj is older than this run',
    'smoke result missing for dwc/a/Two.bbj',
    'behaviour result missing for issue #4 of dwc/a/One.bbj',
    'behaviour result missing for dwc/a/Four.bbj',
  ]);
});

test('completenessFailures: a red result is a result, a stale behaviour result is not', () => {
  const failures = completenessFailures({
    apps: [apps[0]],
    manifest: { entries: [manifest.entries[0]] },
    samples: [smoke('courses-dwc-a-one', { status: 'fail', reasons: [{ category: 'bbj', detail: 'x' }] })],
    behaviour: [behaviour('dwc/a/One.bbj', { issue: 4, startedAt: EARLIER, outcome: 'fail' })],
    startedAt: START,
  });
  assert.deepEqual(failures, ['behaviour result missing for dwc/a/One.bbj', 'behaviour result missing for issue #4 of dwc/a/One.bbj']);
});

test('harnessIssueFailures: a license-leak, a wrapper error and a block by license are failures', () => {
  const failures = harnessIssueFailures(
    {
      samples: [
        smoke('courses-dwc-a-one', { harnessIssue: 'license-leak', leaked: [{ id: '77', program: 'C:/x/One.bbj' }] }),
        smoke('courses-dwc-a-two', { status: 'blocked', reasons: [{ category: 'license', detail: 'out of licenses' }] }),
        smoke('courses-dwc-a-ok'),
      ],
      behaviour: [
        behaviour('dwc/a/One.bbj', { app: 'courses-dwc-a-one', test: 'icon', outcome: 'fail', category: 'harness', harnessIssue: 'wrapper-error', evidence: 'wrapper error: boom' }),
        behaviour('dwc/a/Four.bbj', { app: 'courses-dwc-a-four', test: 'dialog', outcome: 'blocked', category: 'license', evidence: 'sample did not start (license)' }),
      ],
      selftest: [smoke('courses-fixture-known-good', { harnessIssue: 'license-leak', leaked: [{ id: '5', program: 'p' }] })],
      selftestBehaviour: [],
    },
    START,
  );
  assert.deepEqual(failures, [
    'harness issue license-leak in courses-dwc-a-one [smoke]: 77 C:/x/One.bbj',
    'harness issue blocked by license in courses-dwc-a-two [smoke]: license: out of licenses',
    'harness issue license-leak in courses-fixture-known-good [self-test control]: 5 p',
    'harness issue wrapper-error in courses-dwc-a-one [icon]: wrapper error: boom',
    'harness issue blocked by license in courses-dwc-a-four [dialog]: sample did not start (license)',
  ]);
});

test('harnessIssueFailures: a timeout is a finding, red results are findings, old results are ignored', () => {
  const failures = harnessIssueFailures(
    {
      samples: [
        smoke('courses-dwc-a-one', { status: 'fail', reasons: [{ category: 'timeout', detail: 'timed out after 105 s' }] }),
        smoke('courses-dwc-a-two', { status: 'fail', reasons: [{ category: 'bbj', detail: '!ERROR=252' }] }),
        smoke('courses-dwc-a-old', { harnessIssue: 'license-leak', startedAt: EARLIER }),
      ],
      behaviour: [behaviour('dwc/a/One.bbj', { outcome: 'fail', category: 'timeout', evidence: 'timed out after 105 s' })],
    },
    START,
  );
  assert.deepEqual(failures, []);
});

test('summarize counts smoke by status, reason categories once per sample, and behaviour by outcome', () => {
  const summary = summarize({
    samples: [
      smoke('a'),
      smoke('b', { status: 'fail', reasons: [{ category: 'bbj', detail: '1' }, { category: 'bbj', detail: '2' }, { category: 'icons', detail: 'x' }] }),
      smoke('c', { status: 'fail', reasons: [{ category: 'bbj', detail: '3' }] }),
      smoke('d', { status: 'blocked', reasons: [{ category: 'license', detail: 'l' }] }),
    ],
    behaviour: [behaviour('x'), behaviour('y', { outcome: 'fail' })],
  });
  assert.deepEqual(summary.smoke, { total: 4, pass: 1, fail: 2, blocked: 1 });
  assert.deepEqual(summary.smokeCategories, { bbj: 2, icons: 1, license: 1 });
  assert.deepEqual(summary.behaviour, { total: 2, pass: 1, fail: 1, blocked: 0 });
});

test('samplesRunFailures: a normal report is fine, also with red tests', () => {
  assert.deepEqual(samplesRunFailures({ errors: [], stats: { expected: 50, unexpected: 9, flaky: 0, skipped: 0 } }), []);
});

test('samplesRunFailures: no report, global errors and a run without tests are harness failures', () => {
  assert.deepEqual(samplesRunFailures(null), ['samples run left no Playwright report']);
  assert.deepEqual(samplesRunFailures({ errors: [], stats: { expected: 0, unexpected: 0, flaky: 0 } }), ['samples run executed no tests']);
  assert.deepEqual(
    samplesRunFailures({ errors: [{ message: '\u001b[31mregistering apps failed:\u001b[39m\n  x' }], stats: { expected: 0, unexpected: 0, flaky: 0 } }),
    ['samples run reported 1 error(s): registering apps failed:', 'samples run executed no tests'],
  );
});
