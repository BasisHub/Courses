import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { renameWithRetry, replaceFile } from './rename-retry.js';

function failing(code) {
  const error = new Error(`${code}: operation not permitted, rename`);
  error.code = code;
  return error;
}

// A rename stub that throws the given codes in order and then succeeds.
function stub(codes) {
  const calls = [];
  const rename = (from, to) => {
    calls.push([from, to]);
    if (calls.length <= codes.length) throw failing(codes[calls.length - 1]);
  };
  return { rename, calls };
}

test('renameWithRetry succeeds after EPERM twice, waiting 200 ms before each repeat', () => {
  const { rename, calls } = stub(['EPERM', 'EPERM']);
  const waits = [];
  renameWithRetry('a.tmp', 'a', { rename, sleep: (ms) => waits.push(ms) });
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[2], ['a.tmp', 'a']);
  assert.deepEqual(waits, [200, 200]);
});

test('renameWithRetry also retries EBUSY and EACCES', () => {
  const { rename, calls } = stub(['EBUSY', 'EACCES']);
  renameWithRetry('a.tmp', 'a', { rename, sleep: () => {} });
  assert.equal(calls.length, 3);
});

test('renameWithRetry throws the last error after 10 repeats (11 tries)', () => {
  const { rename, calls } = stub(new Array(50).fill('EPERM'));
  const waits = [];
  assert.throws(() => renameWithRetry('a.tmp', 'a', { rename, sleep: (ms) => waits.push(ms) }), { code: 'EPERM' });
  assert.equal(calls.length, 11);
  assert.equal(waits.length, 10);
});

test('renameWithRetry throws any other error at once', () => {
  const { rename, calls } = stub(['ENOENT']);
  assert.throws(() => renameWithRetry('a.tmp', 'a', { rename, sleep: () => assert.fail('no wait') }), { code: 'ENOENT' });
  assert.equal(calls.length, 1);
});

test('renameWithRetry really renames a file with the default rename', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'courses-rename-retry-test-'));
  try {
    const from = path.join(dir, 'a.tmp');
    const to = path.join(dir, 'a.md');
    fs.writeFileSync(from, 'x');
    renameWithRetry(from, to);
    assert.equal(fs.readFileSync(to, 'utf8'), 'x');
    assert.equal(fs.existsSync(from), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('replaceFile writes the content in place when the target stays locked against rename', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'courses-replace-'));
  try {
    const from = path.join(dir, 'report.md.tmp');
    const to = path.join(dir, 'report.md');
    fs.writeFileSync(from, 'new report');
    fs.writeFileSync(to, 'old report');
    const { rename, calls } = stub(Array(11).fill('EPERM'));
    const how = replaceFile(from, to, { rename, sleep: () => {} });
    assert.equal(how, 'written');
    assert.equal(calls.length, 11);
    assert.equal(fs.readFileSync(to, 'utf8'), 'new report');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('replaceFile renames when the rename works and rethrows other errors', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'courses-replace-'));
  try {
    const from = path.join(dir, 'a.tmp');
    const to = path.join(dir, 'a.md');
    fs.writeFileSync(from, 'fresh');
    assert.equal(replaceFile(from, to), 'renamed');
    assert.equal(fs.readFileSync(to, 'utf8'), 'fresh');
    const { rename } = stub(['ENOENT']);
    assert.throws(() => replaceFile(from, to, { rename, sleep: () => {} }), /ENOENT/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
