// Paths, env file and tool settings for the sample-test harness.
//
// The admin credentials live in tools/sample-test/.env of the MAIN checkout (git ignores it, so a
// git worktree does not have its own copy). This module finds that file, lists its key names and
// keeps values for a short allowlist of non-secret keys only. Credential values never pass
// through this module: the Java admin tool reads the file itself.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const harnessDir = path.resolve(import.meta.dirname, '..');
export const repoRoot = path.resolve(harnessDir, '..', '..');
export const examplesDir = path.join(repoRoot, 'docs', 'examples');
export const docsDir = path.join(repoRoot, 'docs', 'docs');
export const fixturesDir = path.join(harnessDir, 'fixtures');
export const adminToolPath = path.join(harnessDir, 'admin', 'BBjAdminTool.java');

/** Replace backslashes with forward slashes. */
export function toPosix(p) {
  return String(p).replace(/\\/g, '/');
}

let mainCache = null;

/**
 * The main checkout (the folder that owns the .git directory). In a git worktree this differs
 * from repoRoot. Falls back to repoRoot when git cannot answer.
 */
export function mainCheckout() {
  if (mainCache) return mainCache;
  let found = repoRoot;
  try {
    const r = spawnSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
      cwd: harnessDir,
      encoding: 'utf8',
      shell: false,
      windowsHide: true,
    });
    const out = r.status === 0 ? String(r.stdout || '').trim() : '';
    if (out) found = path.resolve(path.dirname(out));
  } catch {
    // git missing or not runnable: keep repoRoot
  }
  mainCache = found;
  return mainCache;
}

/** First existing env file; throws an Error that lists the searched paths (paths only). */
export function envFile() {
  const candidates = [];
  if (process.env.SAMPLE_TEST_ENV) candidates.push(process.env.SAMPLE_TEST_ENV);
  candidates.push(path.join(harnessDir, '.env'));
  candidates.push(path.join(mainCheckout(), 'tools', 'sample-test', '.env'));
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  throw new Error(`no env file found; searched: ${candidates.join(', ')}`);
}

// Keys whose values this module may keep. Everything else in the file contributes its name only.
const ALLOWLIST = ['BBJ_HOME', 'BBJ_URL', 'JAVA_BIN'];

function unquote(value) {
  if (value.length >= 2) {
    const first = value[0];
    if ((first === '"' || first === "'") && value[value.length - 1] === first) {
      return value.slice(1, -1);
    }
  }
  return value;
}

function readEnv(file) {
  const names = [];
  const values = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    names.push(m[1]);
    if (ALLOWLIST.includes(m[1])) values[m[1]] = unquote(m[2]);
  }
  return { names, values };
}

/** Key names found in the env file, never values. */
export function envKeyNames(file = envFile()) {
  return readEnv(file).names;
}

function newestJdkJava() {
  const exe = process.platform === 'win32' ? 'java.exe' : 'java';
  const base = path.join(os.homedir(), '.jdks');
  let entries = [];
  try {
    entries = fs.readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory());
  } catch {
    return null;
  }
  const found = [];
  for (const e of entries) {
    const dir = path.join(base, e.name);
    const java = path.join(dir, 'bin', exe);
    if (!fs.existsSync(java)) continue;
    found.push({ java, mtime: fs.statSync(dir).mtimeMs });
  }
  found.sort((a, b) => b.mtime - a.mtime);
  return found.length ? found[0].java : null;
}

/**
 * Non-secret settings. process.env wins over the env file. Without an env file this returns the
 * defaults and never throws, so playwright.config.js can import it and tests can be listed
 * without credentials.
 */
export function settings() {
  let values = {};
  try {
    values = readEnv(envFile()).values;
  } catch {
    // no env file: defaults only
  }
  const pick = (key) => process.env[key] || values[key] || '';
  return {
    bbjHome: toPosix(pick('BBJ_HOME') || 'C:/bbx').replace(/\/+$/, ''),
    bbjUrl: (pick('BBJ_URL') || 'http://localhost:8888').replace(/\/+$/, ''),
    javaBin: pick('JAVA_BIN') || newestJdkJava() || 'java',
  };
}

export function bbjHome() {
  return settings().bbjHome;
}

export function bbjUrl() {
  return settings().bbjUrl;
}

export function javaBin() {
  return settings().javaBin;
}

/**
 * Results folder of the main checkout (or SAMPLE_TEST_RESULTS), created on demand. When the last
 * part has a file extension (`resultsDir('run.json')`), only its parent folder is created and the
 * file path is returned, so callers can read and write result files directly.
 */
export function resultsDir(...sub) {
  const base =
    process.env.SAMPLE_TEST_RESULTS || path.join(mainCheckout(), 'tools', 'sample-test', 'results');
  const target = path.resolve(path.join(base, ...sub));
  const isFile = sub.length > 0 && /\.[a-z0-9]+$/i.test(path.basename(String(sub[sub.length - 1])));
  fs.mkdirSync(isFile ? path.dirname(target) : target, { recursive: true });
  return target;
}

/**
 * Checkout roots whose docs/examples and fixtures hold harness programs: the main checkout and,
 * when the harness runs from a git worktree, that worktree. Unique, lower-case, POSIX, no
 * trailing slash.
 */
export function harnessRoots() {
  return [...new Set([mainCheckout(), repoRoot].map((p) => toPosix(p).replace(/\/+$/, '').toLowerCase()))];
}
