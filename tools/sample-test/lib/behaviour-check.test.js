import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_ISSUES, behaviourTitles, missingBehaviour, parseIssueList } from './behaviour-check.js';

const manifest = {
  entries: [
    { id: 'dwc/01/A.bbj', kind: 'window', issues: [4] },
    { id: 'dwc/01/B.bbj', kind: 'dialog', issues: [] },
    { id: 'dwc/02/C.bbj', kind: 'print', issues: [] },
    { id: 'dwc/02/D.bbj', kind: 'starter', issues: [7] },
    { id: 'dwc/02/E.bbj', kind: 'class', issues: [] },
    { id: 'intro-bbj/F.bbj', kind: 'window', issues: [] },
  ],
};

// The shape `playwright test --list --reporter=json` prints: file suites at the top, the file of the
// test() call (lib/behaviour.js here) on each spec.
const report = {
  suites: [
    {
      title: 'smoke.spec.js',
      file: 'smoke.spec.js',
      specs: [{ title: 'smoke [dwc/01/A.bbj]', file: '../lib/behaviour.js' }],
    },
    {
      title: 'behaviour/dwc-01.spec.js',
      file: 'behaviour/dwc-01.spec.js',
      specs: [{ title: '[dwc/01/A.bbj] issue #4: icon renders', file: '../lib/behaviour.js' }],
      suites: [
        {
          title: 'group',
          file: 'behaviour/dwc-01.spec.js',
          specs: [{ title: '[dwc/01/B.bbj] shows its message', file: '../lib/behaviour.js' }],
        },
      ],
    },
  ],
};

test('behaviourTitles takes titles from behaviour spec files only, nested suites included', () => {
  assert.deepEqual(behaviourTitles(report), ['[dwc/01/A.bbj] issue #4: icon renders', '[dwc/01/B.bbj] shows its message']);
});

test('behaviourTitles reads the file from the file suite, also with backslashes', () => {
  const windows = { suites: [{ title: 'behaviour\\x.spec.js', file: 'behaviour\\x.spec.js', specs: [{ title: 'one' }] }] };
  assert.deepEqual(behaviourTitles(windows), ['one']);
  assert.deepEqual(behaviourTitles({}), []);
});

test('missingBehaviour lists windows, dialogs and issues without a test; prints, classes and starters need none', () => {
  const titles = behaviourTitles(report);
  assert.deepEqual(missingBehaviour(titles, manifest), [
    'MISSING issue #7 [dwc/02/D.bbj]',
    'MISSING behaviour [intro-bbj/F.bbj]',
  ]);
});

test('missingBehaviour: an issue test also satisfies the entry, a plain test does not satisfy an issue', () => {
  const only = ['[dwc/01/A.bbj] plain check'];
  assert.deepEqual(missingBehaviour(only, { entries: [manifest.entries[0]] }), ['MISSING issue #4 [dwc/01/A.bbj]']);
  const issueOnly = ['[dwc/01/A.bbj] issue #4: icon renders'];
  assert.deepEqual(missingBehaviour(issueOnly, { entries: [manifest.entries[0]] }), []);
});

test('missingBehaviour honours the prefix and the issue list', () => {
  assert.deepEqual(missingBehaviour([], manifest, { prefix: 'dwc/02/' }), ['MISSING issue #7 [dwc/02/D.bbj]']);
  assert.deepEqual(missingBehaviour([], manifest, { prefix: 'dwc/02/', issues: [] }), []);
  assert.deepEqual(missingBehaviour([], manifest, { prefix: 'dwc/01/', issues: [3] }), [
    'MISSING behaviour [dwc/01/A.bbj]',
    'MISSING behaviour [dwc/01/B.bbj]',
  ]);
});

test('an id that is the start of another id does not satisfy it', () => {
  const m = { entries: [{ id: 'dwc/x/Foo.bbj', kind: 'window', issues: [] }] };
  assert.deepEqual(missingBehaviour(['[dwc/x/Foo.bbj.bak] x'], m), ['MISSING behaviour [dwc/x/Foo.bbj]']);
});

test('parseIssueList: default is 3 to 7, none is empty, a list is checked', () => {
  assert.deepEqual(parseIssueList(undefined), [3, 4, 5, 6, 7]);
  assert.deepEqual(ALL_ISSUES, [3, 4, 5, 6, 7]);
  assert.deepEqual(parseIssueList('none'), []);
  assert.deepEqual(parseIssueList('3, 7'), [3, 7]);
  assert.throws(() => parseIssueList('2'), /not one of/);
  assert.throws(() => parseIssueList('x'), /not one of/);
});
