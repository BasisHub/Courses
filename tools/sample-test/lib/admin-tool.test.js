// Tests for admin/BBjAdminTool.java that need a JDK and the BBj .lib folder but no running
// BBjServices: scan, the unregister prefix guard, usage errors and the missing-credentials error.
// The credentials in these tests are fake single letters.
import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { runAdmin, scanForSecrets } from './admin.js';
import { bbjHome, javaBin } from './paths.js';

function skipReason() {
  if (!fs.existsSync(`${bbjHome()}/.lib/BBjAdminAPI.jar`)) return `no BBjAdminAPI.jar under ${bbjHome()}/.lib`;
  const probe = spawnSync(javaBin(), ['-version'], { shell: false, windowsHide: true });
  if (probe.status !== 0) return 'no runnable Java';
  return false;
}
const skip = skipReason();

let tmp;
let savedEnv;

beforeEach(() => {
  savedEnv = process.env.SAMPLE_TEST_ENV;
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'courses-admin-tool-test-'));
});

afterEach(() => {
  if (savedEnv === undefined) delete process.env.SAMPLE_TEST_ENV;
  else process.env.SAMPLE_TEST_ENV = savedEnv;
  fs.rmSync(tmp, { recursive: true, force: true });
});

function useEnv(text) {
  const file = path.join(tmp, 'fake.env');
  fs.writeFileSync(file, text);
  process.env.SAMPLE_TEST_ENV = file;
}

test('scan reports CLEAN for a file without the password and LEAK for one that contains it', { skip }, async () => {
  useEnv('BBJ_ADMIN_USER=x\r\nBBJ_ADMIN_PASSWORD=y\r\n');
  const clean = path.join(tmp, 'clean.txt');
  const leaky = path.join(tmp, 'leaky.txt');
  fs.writeFileSync(clean, 'nothing to see here: 1 2 3\n');
  fs.writeFileSync(leaky, 'the value is y somewhere\n');
  assert.equal(await scanForSecrets(clean), 'CLEAN');
  assert.deepEqual(await scanForSecrets(leaky), ['BBJ_ADMIN_PASSWORD']);
  const res = await runAdmin('scan', [leaky]);
  assert.equal(res.code, 2);
  assert.deepEqual(res.lines, ['LEAK BBJ_ADMIN_PASSWORD']);
});

test('unregister refuses every prefix outside courses- before any admin connection (exit 3)', { skip }, async () => {
  useEnv('BBJ_ADMIN_USER=x\nBBJ_ADMIN_PASSWORD=y\n');
  // Each launch takes several seconds (the whole .lib folder is on the classpath): three cases.
  for (const prefix of ['demo-', '', 'courses-A']) {
    const res = await runAdmin('unregister', [prefix]);
    assert.equal(res.code, 3, `prefix "${prefix}"`);
    assert.equal(res.lines.length, 1);
    assert.match(res.lines[0], /^REFUSED/);
  }
});

test('bad usage exits 64 with a USAGE line and a missing credential exits 1', { skip }, async () => {
  useEnv('BBJ_ADMIN_USER=x\nBBJ_ADMIN_PASSWORD=y\n');
  await assert.rejects(runAdmin('bogus'), /failed \(exit 64\): USAGE/);
  await assert.rejects(runAdmin('killids'), /failed \(exit 64\): USAGE/);
  useEnv('BBJ_HOME=C:/bbx\n');
  await assert.rejects(runAdmin('status'), /failed \(exit 1\): ERROR missing BBJ_ADMIN_USER or BBJ_ADMIN_PASSWORD/);
});
