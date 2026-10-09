// The pure parts of the test wrappers: the deadline race, the deadline arithmetic, the outcome rule
// and the evidence texts. The wrappers themselves are proven live by the self-test.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BlockedError,
  deadlineFor,
  describeBbjError,
  describeFailure,
  expectedStartState,
  firstLine,
  judge,
  timeoutText,
  withDeadline,
} from './behaviour.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('withDeadline returns the value when fn finishes first', async () => {
  assert.deepEqual(await withDeadline(500, async () => 42), { timedOut: false, value: 42 });
});

test('withDeadline returns the error when fn rejects first, also a falsy one', async () => {
  const boom = new Error('boom');
  const a = await withDeadline(500, async () => {
    throw boom;
  });
  assert.equal(a.timedOut, false);
  assert.equal(a.error, boom);
  const b = await withDeadline(500, () => Promise.reject(undefined));
  assert.equal('error' in b, true);
});

test('withDeadline turns a function that throws before it returns a promise into an error result', async () => {
  const r = await withDeadline(500, () => {
    throw new Error('sync');
  });
  assert.equal(r.timedOut, false);
  assert.equal(r.error.message, 'sync');
});

test('withDeadline reports a timeout, and a late rejection afterwards is swallowed', async () => {
  const seen = [];
  const onUnhandled = (reason) => seen.push(reason);
  process.on('unhandledRejection', onUnhandled);
  try {
    const r = await withDeadline(30, async () => {
      await sleep(80);
      throw new Error('too late');
    });
    assert.deepEqual(r, { timedOut: true });
    await sleep(150);
    assert.deepEqual(seen, [], 'no unhandled rejection');
  } finally {
    process.off('unhandledRejection', onUnhandled);
  }
});

test('withDeadline clears its timer: the process is not held for the full deadline', async () => {
  const t0 = Date.now();
  await withDeadline(60000, async () => 'quick');
  assert.ok(Date.now() - t0 < 1000);
});

test('deadlineFor leaves a margin of 15 s below the test timeout and never goes under 5 s', () => {
  assert.equal(deadlineFor({ timeout: 120000 }), 105000);
  assert.equal(deadlineFor({ timeout: 120000 }, 30000), 90000);
  assert.equal(deadlineFor({ timeout: 10000 }), 5000);
  assert.equal(deadlineFor({ timeout: 0 }), 5000);
});

test('BlockedError is an Error with its reason as message', () => {
  const e = new BlockedError('oracle element missing');
  assert.ok(e instanceof Error);
  assert.equal(e.message, 'oracle element missing');
  assert.equal(e.name, 'BlockedError');
});

test('expectedStartState: windows and starters open a window, prints the console, dialogs a dialog', () => {
  assert.equal(expectedStartState('window'), 'window');
  assert.equal(expectedStartState('starter'), 'window');
  assert.equal(expectedStartState('print'), 'console');
  assert.equal(expectedStartState('dialog'), 'dialog');
});

test('firstLine takes the first non-empty line and removes colour codes', () => {
  assert.equal(firstLine(new Error('\n  \x1b[2mexpect(\x1b[22mlocator\x1b[2m).toBeVisible()\x1b[22m failed\nLocator: x')), 'expect(locator).toBeVisible() failed');
  assert.equal(firstLine('plain'), 'plain');
  assert.equal(firstLine(undefined), 'unknown error');
});

test('describeFailure adds the Locator, Expected and Received lines under the first line', () => {
  const error = new Error(
    ['expect(locator).toBeVisible() failed', '', "Locator: getByText('x')", 'Expected: visible', 'Received: <element(s) not found>', 'Timeout: 2000ms', 'Call log:'].join('\n'),
  );
  assert.equal(
    describeFailure(error),
    "expect(locator).toBeVisible() failed; Locator: getByText('x'); Expected: visible; Received: <element(s) not found>",
  );
  assert.equal(describeFailure(new Error('just this')), 'just this');
});

test('describeFailure cuts a very long message', () => {
  const text = describeFailure(new Error('x'.repeat(2000)));
  assert.ok(text.length <= 700);
  assert.ok(text.endsWith('...'));
});

test('describeBbjError names code, message and line', () => {
  assert.equal(describeBbjError({ code: 252, message: 'Method not found', line: 4 }), '!ERROR=252 Method not found at line 4');
  assert.equal(describeBbjError({ code: 12, message: '', line: null }), '!ERROR=12');
});

test('timeoutText states the seconds, the last note and the console', () => {
  assert.equal(timeoutText(105000, ['a', 'b'], 'clicked'), 'timed out after 105 s; last note: clicked; console: a / b');
  assert.equal(timeoutText(5000, [], null), 'timed out after 5 s; last note: none; console: none');
  assert.equal(timeoutText(5000, ['a']), 'timed out after 5 s; console: a');
});

test('judge: a body that returns is a pass without evidence', () => {
  assert.deepEqual(judge({ bodyError: null, bbjErrors: [] }), { outcome: 'pass', category: null, evidence: null });
});

test('judge: a thrown assertion is a fail with category assertion and evidence starting "failed:"', () => {
  const v = judge({ bodyError: new Error('expect(x).toBe(y) failed'), bbjErrors: [] });
  assert.equal(v.outcome, 'fail');
  assert.equal(v.category, 'assertion');
  assert.equal(v.evidence, 'failed: expect(x).toBe(y) failed');
});

test('judge: a BlockedError is blocked with category check and its message', () => {
  assert.deepEqual(judge({ bodyError: new BlockedError('oracle element missing'), bbjErrors: [] }), {
    outcome: 'blocked',
    category: 'check',
    evidence: 'oracle element missing',
  });
});

test('judge: a BBj error turns a pass into a fail with category bbj', () => {
  const v = judge({ bodyError: null, bbjErrors: [{ code: 252, message: 'Method not found', line: 4 }] });
  assert.deepEqual(v, { outcome: 'fail', category: 'bbj', evidence: '!ERROR=252 Method not found at line 4' });
});

test('judge: a BBj error wins over a failed assertion and keeps it as evidence, and counts more errors', () => {
  const v = judge({
    bodyError: new Error('click failed'),
    bbjErrors: [
      { code: 12, message: 'Missing file', line: 9 },
      { code: 252, message: 'x', line: 10 },
    ],
  });
  assert.equal(v.outcome, 'fail');
  assert.equal(v.category, 'bbj');
  assert.equal(v.evidence, '!ERROR=12 Missing file at line 9 (+1 more); body: failed: click failed');
});
