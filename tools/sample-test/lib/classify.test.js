import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { classify, IGNORED } from './classify.js';
import { emptyObserved, STATUSES, CATEGORIES, WARNING_CATEGORIES } from './schema.js';

// Synthetic console text. The serial and the header label are built at
// runtime so that no file in the repository contains either literally.
const SERIAL = 'BBX' + '123456';
const LABEL = 'Serial ' + 'Number: ';
const HEADER = ['BBj WebCUI Console', 'Server BBj Version: REV 26.03', LABEL + SERIAL, ''];
const ERROR_BODY = [
  '!ERROR=252  (No match for method jdk.proxy2.$Proxy171.noSuchMethod())',
  '[4] st!.noSuchMethod()',
  '',
  'READY',
];
const PRINT_BODY = ['courses fixture line 1', 'courses fixture line 2', '', 'READY'];

const expected = JSON.parse(
  fs.readFileSync(new URL('../fixtures/expected.json', import.meta.url), 'utf8'),
);

function observation(overrides = {}) {
  return { ...emptyObserved(), start: { state: 'window', ms: 800 }, ...overrides };
}

function run(kind, observed, expect = {}) {
  return classify({ kind, expect, observed: observation(observed) });
}

function categories(findings) {
  return findings.map((f) => f.category);
}

// One synthetic observation per control program, shaped like what the live
// self-test (plan 08) sees.
const OBSERVATIONS = {
  'known-good.bbj': observation({ title: 'Courses fixture good' }),
  'known-broken.bbj': observation({
    title: 'Courses fixture broken',
    consoleLines: [...HEADER, ...ERROR_BODY],
  }),
  'known-print.bbj': observation({
    start: { state: 'console', ms: 900 },
    consoleLines: [...HEADER, ...PRINT_BODY],
  }),
  'known-missing-css.bbj': observation({
    title: 'Courses fixture missing css',
    network: [
      {
        url: 'http://localhost:8888/courses-fixture-does-not-exist.css',
        status: 404,
        error: null,
        external: false,
      },
    ],
  }),
};

test('every control program in expected.json has a synthetic observation and the reverse', () => {
  assert.deepEqual(Object.keys(OBSERVATIONS).sort(), Object.keys(expected).sort());
});

for (const [name, fixture] of Object.entries(expected)) {
  test(`${name} classifies as expected.json says`, () => {
    const result = classify({
      kind: fixture.kind,
      expect: fixture.expect,
      observed: OBSERVATIONS[name],
    });
    const want = fixture.classification;
    assert.equal(result.status, want.status);
    if (want.category) {
      assert.equal(result.reasons[0].category, want.category);
    } else {
      assert.deepEqual(result.reasons, []);
      assert.deepEqual(result.warnings, []);
    }
    if (want.bbjError) {
      assert.equal(result.bbjErrors[0].code, want.bbjError.code);
      assert.equal(result.bbjErrors[0].line, want.bbjError.line);
    }
    if (want.network) {
      assert.ok(result.reasons[0].detail.includes(String(want.network.status)));
      assert.ok(result.reasons[0].detail.includes(want.network.urlIncludes));
    }
    assert.ok(STATUSES.includes(result.status));
    assert.ok(result.reasons.every((r) => CATEGORIES.includes(r.category)));
    assert.ok(result.warnings.every((w) => WARNING_CATEGORIES.includes(w.category)));
    assert.ok(!JSON.stringify(result).includes(SERIAL), 'result must not carry the serial');
  });
}

test('known-broken also reports the version, the printed lines and a safe excerpt', () => {
  const result = classify({
    kind: expected['known-broken.bbj'].kind,
    expect: expected['known-broken.bbj'].expect,
    observed: OBSERVATIONS['known-broken.bbj'],
  });
  assert.equal(result.bbjVersion, 'REV 26.03');
  assert.deepEqual(result.printed, []);
  assert.ok(result.consoleExcerpt[0].startsWith('!ERROR=252'));
  assert.ok(result.reasons[0].detail.includes('at line 4: st!.noSuchMethod()'));
  assert.ok(result.bbjErrors[0].message.includes('noSuchMethod'));
});

test('known-print captures both printed lines', () => {
  const result = classify({
    kind: expected['known-print.bbj'].kind,
    expect: expected['known-print.bbj'].expect,
    observed: OBSERVATIONS['known-print.bbj'],
  });
  assert.deepEqual(result.printed, ['courses fixture line 1', 'courses fixture line 2']);
});

test('license dialog gives blocked with category license', () => {
  const result = run('window', {
    start: { state: 'dialog', ms: 500 },
    dialogs: [{ title: 'License Error', text: '[E3008] License BBJ out of licenses' }],
  });
  assert.equal(result.status, 'blocked');
  assert.deepEqual(categories(result.reasons), ['license']);
});

test('start state license gives blocked even without a dialog', () => {
  const result = run('window', { start: { state: 'license', ms: 500 } });
  assert.equal(result.status, 'blocked');
  assert.equal(result.reasons[0].category, 'license');
});

test('a dialog titled License Error is blocked whatever the code', () => {
  const result = run('window', {
    start: { state: 'dialog', ms: 500 },
    dialogs: [{ title: 'License Error', text: '[E3001] something else' }],
  });
  assert.equal(result.status, 'blocked');
});

test('blocked ignores the other findings', () => {
  const result = run('window', {
    start: { state: 'license', ms: 500 },
    pageErrors: ['boom'],
    network: [{ url: 'http://localhost/x.css', status: 404, error: null, external: false }],
  });
  assert.equal(result.status, 'blocked');
  assert.equal(result.reasons.length, 1);
});

test('start state timeout fails with category start', () => {
  const result = run('window', { start: { state: 'timeout', ms: 30000 } });
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'start');
  assert.deepEqual(categories(result.reasons), ['start']);
});

test('window kind with a console that returned to READY fails with category console', () => {
  const result = run('window', { consoleLines: [...HEADER, 'done', '', 'READY'] });
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'console');
});

test('window kind with a console that is still running passes with a console-output warning', () => {
  const result = run('window', { consoleLines: [...HEADER, 'started'] });
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.reasons, []);
  assert.equal(result.warnings[0].category, 'console-output');
  assert.ok(result.warnings[0].detail.includes('started'));
});

test('window kind that started as a console fails with category start', () => {
  const result = run('window', {
    start: { state: 'console', ms: 900 },
    consoleLines: [...HEADER, 'done', '', 'READY'],
  });
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'start');
  assert.ok(result.reasons[0].detail.includes('console'));
});

test('dialog kind passes when the expected dialog is there', () => {
  const result = run(
    'dialog',
    {
      start: { state: 'dialog', ms: 700 },
      dialogs: [{ title: 'Greetings', text: "Hello from BBj's DWC client!" }],
    },
    { dialog: { title: 'Greetings' } },
  );
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.reasons, []);
});

test('dialog kind checks the dialog text when the expectation has one', () => {
  const dialogs = [{ title: 'Greetings', text: "Hello from BBj's DWC client!" }];
  const ok = run('dialog', { dialogs }, { dialog: { title: 'Greetings', text: 'Hello from' } });
  assert.equal(ok.status, 'pass');
  const bad = run('dialog', { dialogs }, { dialog: { title: 'Greetings', text: 'Goodbye' } });
  assert.equal(bad.status, 'fail');
  assert.equal(bad.reasons[0].category, 'dialog');
});

test('dialog kind without a dialog fails with category dialog', () => {
  const result = run('dialog', {}, { dialog: { title: 'Greetings' } });
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'dialog');
});

test('dialog kind with a different title fails with category dialog', () => {
  const result = run(
    'dialog',
    { dialogs: [{ title: 'Other', text: 'x' }] },
    { dialog: { title: 'Greetings' } },
  );
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'dialog');
});

test('Error dialog gives a bbj failure with code and no line', () => {
  const result = run('window', {
    start: { state: 'dialog', ms: 500 },
    dialogs: [{ title: 'Error', text: '!ERROR=12 (Missing file C:/x.bbj)' }],
  });
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'bbj');
  assert.equal(result.bbjErrors[0].code, 12);
  assert.equal(result.bbjErrors[0].line, null);
  assert.equal(result.bbjErrors[0].message, 'Missing file C:/x.bbj');
});

test('Error dialog without a readable error code still fails with category bbj', () => {
  const result = run('window', { dialogs: [{ title: 'Error', text: 'Something odd happened' }] });
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'bbj');
  assert.ok(result.reasons[0].detail.includes('Something odd happened'));
  assert.deepEqual(result.bbjErrors, []);
});

test('the break-to-console dialog gives category console', () => {
  const result = run('window', {
    start: { state: 'dialog', ms: 500 },
    dialogs: [
      {
        title: 'Error',
        text: 'Thin Client Console Error: Program attempted to break to console, which is not allowed by the server',
      },
    ],
  });
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'console');
  assert.ok(!categories(result.reasons).includes('bbj'));
});

test('a page error fails with category page', () => {
  const result = run('window', { pageErrors: ['e.componentOnReady is not a function'] });
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'page');
  assert.ok(result.reasons[0].detail.includes('componentOnReady'));
});

test('a console error fails with category console-error, a console warning only warns', () => {
  const failing = run('window', { consoleErrors: ['boom'] });
  assert.equal(failing.status, 'fail');
  assert.equal(failing.reasons[0].category, 'console-error');
  const warning = run('window', { consoleWarnings: ['careful'] });
  assert.equal(warning.status, 'pass');
  assert.equal(warning.warnings[0].category, 'console-warning');
});

test('an external 404 fails with category network-external', () => {
  const result = run('window', {
    network: [{ url: 'https://cdn.example.com/a.js', status: 404, error: null, external: true }],
  });
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'network-external');
  assert.ok(result.reasons[0].detail.includes('404 https://cdn.example.com/a.js'));
});

test('an unresolved external host fails with category network-external', () => {
  const result = run('window', {
    network: [
      {
        url: 'https://nope.invalid/a.css',
        status: null,
        error: 'net::ERR_NAME_NOT_RESOLVED',
        external: true,
      },
    ],
  });
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'network-external');
  assert.ok(result.reasons[0].detail.includes('net::ERR_NAME_NOT_RESOLVED'));
});

test('a local failed request fails with category network-local, a good request does not', () => {
  const failed = run('window', {
    network: [{ url: 'http://localhost:8888/a.png', status: 500, error: null, external: false }],
  });
  assert.equal(failed.reasons[0].category, 'network-local');
  const fine = run('window', {
    network: [{ url: 'http://localhost:8888/a.png', status: 200, error: null, external: false }],
  });
  assert.equal(fine.status, 'pass');
});

test('missing icons fail with category icons and name each one', () => {
  const result = run('window', {
    icons: {
      total: 3,
      rendered: 1,
      missing: [
        { pool: 'feather', name: 'download' },
        { pool: 'fa', name: 'fas-download' },
      ],
    },
  });
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'icons');
  assert.ok(result.reasons[0].detail.includes('1/3 icons rendered'));
  assert.ok(result.reasons[0].detail.includes('feather:download'));
  assert.ok(result.reasons[0].detail.includes('fa:fas-download'));
  const fine = run('window', { icons: { total: 3, rendered: 3, missing: [] } });
  assert.equal(fine.status, 'pass');
});

test('a title mismatch on an otherwise clean window passes with a title warning', () => {
  const result = run('window', { title: 'Something else' }, { title: 'Courses fixture good' });
  assert.equal(result.status, 'pass');
  assert.equal(result.warnings[0].category, 'title');
});

test('debug log errors only warn', () => {
  const result = run('window', { debugLog: { file: 'Debug.log', newLines: 4, errorLines: 2 } });
  assert.equal(result.status, 'pass');
  assert.equal(result.warnings[0].category, 'debug-log');
});

test('print kind with a missing expected line fails with category print', () => {
  const result = run(
    'print',
    { start: { state: 'console', ms: 900 }, consoleLines: [...HEADER, 'courses fixture line 1', '', 'READY'] },
    { print: ['courses fixture line 1', 'courses fixture line 2'] },
  );
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'print');
  assert.ok(result.reasons[0].detail.includes('courses fixture line 2'));
});

test('print kind that never reached the console fails with category start', () => {
  const result = run('print', { start: { state: 'window', ms: 800 } }, { print: ['x'] });
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'start');
});

test('print kind with a BBj error fails with category bbj', () => {
  const result = run(
    'print',
    { start: { state: 'console', ms: 900 }, consoleLines: [...HEADER, ...ERROR_BODY] },
    { print: [] },
  );
  assert.equal(result.status, 'fail');
  assert.equal(result.reasons[0].category, 'bbj');
});

test('starter kind behaves exactly like window', () => {
  const clean = run('starter', { title: 'Courses fixture good' }, { title: 'Courses fixture good' });
  assert.equal(clean.status, 'pass');
  const ended = run('starter', { consoleLines: [...HEADER, 'done', '', 'READY'] });
  assert.equal(ended.status, 'fail');
  assert.equal(ended.reasons[0].category, 'console');
});

test('several findings are all reported and the first one decides the category order', () => {
  const result = run('window', {
    consoleLines: [...HEADER, ...ERROR_BODY],
    pageErrors: ['p'],
    consoleErrors: ['c'],
  });
  assert.deepEqual(categories(result.reasons), ['bbj', 'page', 'console-error']);
});

test('IGNORED entries suppress the findings they match', () => {
  IGNORED.consoleErrors.push(/known noise/);
  IGNORED.pageErrors.push(/known noise/);
  IGNORED.network.push(/favicon\.ico$/);
  try {
    const result = run('window', {
      consoleErrors: ['known noise here'],
      pageErrors: ['known noise here'],
      network: [{ url: 'http://localhost:8888/favicon.ico', status: 404, error: null, external: false }],
    });
    assert.equal(result.status, 'pass');
    const other = run('window', { consoleErrors: ['other'] });
    assert.equal(other.status, 'fail');
  } finally {
    IGNORED.consoleErrors.pop();
    IGNORED.pageErrors.pop();
    IGNORED.network.pop();
  }
  assert.deepEqual(IGNORED, { consoleErrors: [], pageErrors: [], network: [] });
});

test('an unknown kind is rejected', () => {
  assert.throws(() => classify({ kind: 'class', expect: {}, observed: observation() }), /kind/);
});

test('classify does not change the observation it is given', () => {
  const observed = observation({ consoleLines: [...HEADER, ...ERROR_BODY], pageErrors: ['p'] });
  const before = JSON.stringify(observed);
  classify({ kind: 'window', expect: {}, observed });
  assert.equal(JSON.stringify(observed), before);
});
