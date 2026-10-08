import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  harnessDir,
  repoRoot,
  examplesDir,
  docsDir,
  fixturesDir,
  adminToolPath,
  toPosix,
  mainCheckout,
  envFile,
  envKeyNames,
  settings,
  bbjHome,
  bbjUrl,
  javaBin,
  resultsDir,
  harnessRoots,
} from './paths.js';

const KEYS = ['SAMPLE_TEST_ENV', 'SAMPLE_TEST_RESULTS', 'BBJ_HOME', 'BBJ_URL', 'JAVA_BIN'];
let tmp;
let saved;

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'courses-paths-test-'));
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  fs.rmSync(tmp, { recursive: true, force: true });
});

function writeEnv(text) {
  const file = path.join(tmp, 'test.env');
  fs.writeFileSync(file, text);
  process.env.SAMPLE_TEST_ENV = file;
  return file;
}

test('env file with CRLF: key names are listed and only the allowlist keeps a value', () => {
  writeEnv('BBJ_ADMIN_USER=x\r\nBBJ_ADMIN_PASSWORD=y\r\nBBJ_HOME=D:/bbj\r\n');
  assert.deepEqual(envKeyNames(), ['BBJ_ADMIN_USER', 'BBJ_ADMIN_PASSWORD', 'BBJ_HOME']);
  assert.equal(settings().bbjHome, 'D:/bbj');
  assert.equal(bbjHome(), 'D:/bbj');
  const json = JSON.stringify(settings());
  assert.ok(!json.includes('"x"'), 'user value must not be stored');
  assert.ok(!json.includes('"y"'), 'password value must not be stored');
  assert.deepEqual(Object.keys(settings()).sort(), ['bbjHome', 'bbjUrl', 'javaBin']);
});

test('env file parsing skips comments and blank lines and strips one pair of quotes', () => {
  writeEnv('# a comment\n\nBBJ_URL="http://h:1234/"\nJAVA_BIN=\'C:/jdk/bin/java.exe\'\nOTHER = z\n');
  assert.deepEqual(envKeyNames(), ['BBJ_URL', 'JAVA_BIN', 'OTHER']);
  assert.equal(bbjUrl(), 'http://h:1234');
  assert.equal(javaBin(), 'C:/jdk/bin/java.exe');
  assert.ok(!JSON.stringify(settings()).includes('"z"'));
});

test('process.env wins over the env file for the allowlisted keys', () => {
  writeEnv('BBJ_HOME=D:/bbj\n');
  process.env.BBJ_HOME = 'E:\\other\\';
  assert.equal(bbjHome(), 'E:/other');
});

test('defaults: bbjUrl is http://localhost:8888 and bbjHome is C:/bbx when the file has neither', () => {
  writeEnv('BBJ_ADMIN_USER=x\n');
  assert.equal(bbjUrl(), 'http://localhost:8888');
  assert.equal(bbjHome(), 'C:/bbx');
});

test('settings never throws, and envFile names the searched paths when no file is found', () => {
  process.env.SAMPLE_TEST_ENV = path.join(tmp, 'missing.env');
  assert.doesNotThrow(() => settings());
  try {
    const found = envFile();
    assert.ok(fs.existsSync(found), 'a fallback env file must exist when envFile returns');
  } catch (e) {
    assert.match(e.message, /missing\.env/);
    assert.match(e.message, /\.env/);
  }
});

test('javaBin: JAVA_BIN first, else a java executable or plain java', () => {
  process.env.JAVA_BIN = 'D:/jdk/bin/java.exe';
  assert.equal(javaBin(), 'D:/jdk/bin/java.exe');
  delete process.env.JAVA_BIN;
  writeEnv('BBJ_ADMIN_USER=x\n');
  assert.match(toPosix(javaBin()), /(^java$|\/java(\.exe)?$)/);
});

test('resultsDir joins sub folders under SAMPLE_TEST_RESULTS and creates them', () => {
  process.env.SAMPLE_TEST_RESULTS = tmp;
  const dir = resultsDir('samples');
  assert.equal(path.resolve(dir), path.resolve(path.join(tmp, 'samples')));
  assert.ok(fs.statSync(dir).isDirectory());
  assert.ok(path.isAbsolute(dir));
});

test('mainCheckout holds the harness and harnessRoots lists it once, lower-case, no trailing slash', () => {
  const main = mainCheckout();
  assert.ok(fs.existsSync(path.join(main, 'tools', 'sample-test', 'package.json')));
  const roots = harnessRoots();
  assert.ok(roots.includes(toPosix(main).toLowerCase().replace(/\/+$/, '')));
  assert.equal(new Set(roots).size, roots.length);
  for (const r of roots) {
    assert.ok(!r.endsWith('/'), `${r} must not end with /`);
    assert.equal(r, r.toLowerCase());
    assert.ok(!r.includes('\\'));
  }
});

test('path constants hang off the harness folder', () => {
  assert.equal(toPosix('a\\b\\c'), 'a/b/c');
  assert.equal(path.basename(harnessDir), 'sample-test');
  assert.equal(repoRoot, path.resolve(harnessDir, '..', '..'));
  assert.equal(examplesDir, path.join(repoRoot, 'docs', 'examples'));
  assert.equal(docsDir, path.join(repoRoot, 'docs', 'docs'));
  assert.equal(fixturesDir, path.join(harnessDir, 'fixtures'));
  assert.equal(adminToolPath, path.join(harnessDir, 'admin', 'BBjAdminTool.java'));
});
