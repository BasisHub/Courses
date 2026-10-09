import test from 'node:test';
import assert from 'node:assert/strict';
import { findLeak } from './leak.js';

const status = (inUse, processes = []) => ({ licenses: { BBJ: { total: 3, inUse } }, processes });

test('no leak when the licenses in use are back at the start value', () => {
  assert.equal(findLeak(new Set(['1']), 1, status(1, [{ id: '1', program: 'x.bbj' }])), null);
});

test('no leak when fewer licenses are in use than before', () => {
  assert.equal(findLeak(new Set(['1', '2']), 2, status(1, [{ id: '1', program: 'x.bbj' }])), null);
});

test('a leak lists the sessions that were not there before', () => {
  const current = status(2, [
    { id: '1', program: 'old.bbj' },
    { id: '9', program: 'C:/x/docs/examples/new.bbj' },
  ]);
  assert.deepEqual(findLeak(new Set(['1']), 1, current), [{ id: '9', program: 'C:/x/docs/examples/new.bbj' }]);
});

test('a leak with no listed new session still counts and gives an empty list', () => {
  assert.deepEqual(findLeak(new Set(['1']), 0, status(1, [{ id: '1', program: 'a.bbj' }])), []);
});

test('ids compare as strings and an array works as the before set', () => {
  assert.deepEqual(findLeak([1, 2], 0, status(1, [{ id: 2, program: 'a.bbj' }, { id: 3, program: 'b.bbj' }])), [
    { id: '3', program: 'b.bbj' },
  ]);
});

test('a status without BBJ licenses is not a leak', () => {
  assert.equal(findLeak(new Set(), 0, { licenses: {}, processes: [] }), null);
});
