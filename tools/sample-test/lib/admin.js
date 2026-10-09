// Node side of the BBj administration layer: parsers for the Java tool's output, the rule that
// decides which BBj sessions belong to the harness, the run-start session snapshot, and the
// wrappers that call admin/BBjAdminTool.java. Every Java call goes through child_process.spawn
// with an argument array and no shell.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { adminToolPath, bbjHome, envFile, harnessRoots, javaBin, toPosix } from './paths.js';
import { lockPath } from './lock.js';

const LICENSE_RE = /^LICENSE (\S+) total=(\d+) inUse=(\d+)$/;
const PROC_RE = /^PROC id=(\S+) since=(.*?) notResponding=(\S*) prog=(.*)$/;
const URL_RE = /^URL (\S+) (\S+)$/;
const FAIL_RE = /^FAIL (\S+) (.*)$/;
const APP_RE = /^APP (\S+) (.*)$/;

const stripCr = (line) => String(line).replace(/\r$/, '');

/** LICENSE and PROC lines of `status` -> { licenses: { BBJ: { total, inUse }, ... }, processes: Proc[] } */
export function parseStatus(lines) {
  const licenses = { BBJ: { total: 0, inUse: 0 }, WEBCUI: { total: 0, inUse: 0 } };
  const processes = [];
  for (const raw of lines) {
    const line = stripCr(raw);
    let m = line.match(LICENSE_RE);
    if (m) {
      licenses[m[1]] = { total: Number(m[2]), inUse: Number(m[3]) };
      continue;
    }
    m = line.match(PROC_RE);
    if (m) processes.push({ id: m[1], since: m[2], notResponding: m[3], program: m[4] });
  }
  return { licenses, processes };
}

/** URL and FAIL lines of `register-many` -> { urls: { name: url }, failures: [{ name, reason }] } */
export function parseRegister(lines) {
  const urls = {};
  const failures = [];
  for (const raw of lines) {
    const line = stripCr(raw);
    let m = line.match(URL_RE);
    if (m) {
      urls[m[1]] = m[2];
      continue;
    }
    m = line.match(FAIL_RE);
    if (m) failures.push({ name: m[1], reason: m[2] });
  }
  return { urls, failures };
}

/** APP lines of `apps` -> [{ name, program }] */
export function parseApps(lines) {
  const apps = [];
  for (const raw of lines) {
    const m = stripCr(raw).match(APP_RE);
    if (m) apps.push({ name: m[1], program: m[2] });
  }
  return apps;
}

/**
 * Does this BBj session belong to the harness? (W9)
 *
 * True only when the program path (backslashes turned to '/', lower-cased) starts with
 * `<root>/docs/examples/` or `<root>/tools/sample-test/fixtures/` for one of the roots. This is an
 * anchored prefix match, never a substring match. A session still at `<initializing>` counts only
 * when knownIds (the run-start snapshot) is given and does not contain its id: it appeared during
 * the harness window. Everything else is someone else's session and stays untouched.
 */
export function isHarnessSession(proc, { roots = harnessRoots(), knownIds = null } = {}) {
  const raw = toPosix((proc && proc.program) || '').toLowerCase();
  if (raw === '<initializing>') {
    if (!knownIds) return false;
    const ids = knownIds instanceof Set ? knownIds : new Set(knownIds);
    return !ids.has(String(proc.id));
  }
  if (!raw) return false;
  // Collapse '.' and '..' segments so examples/../../x cannot pass the prefix test.
  const p = path.posix.normalize(raw);
  return roots.some((root) => {
    const base = toPosix(root).replace(/\/+$/, '').toLowerCase();
    return p.startsWith(`${base}/docs/examples/`) || p.startsWith(`${base}/tools/sample-test/fixtures/`);
  });
}

/** Sessions that are not in beforeIds and belong to the harness. */
export function newHarnessSessions(beforeIds, processes, { roots = harnessRoots() } = {}) {
  const before = beforeIds instanceof Set ? beforeIds : new Set(beforeIds || []);
  return processes.filter(
    (p) => !before.has(String(p.id)) && isHarnessSession(p, { roots, knownIds: before }),
  );
}

/** Where the run-start session snapshot lives. */
export function runSnapshotPath() {
  return process.env.COURSES_RUN_SNAPSHOT || `${lockPath()}.procs.json`;
}

/** Set of session ids from the snapshot when it belongs to this lock token; else null. */
export function readRunSnapshot(token = process.env.COURSES_LOCK_TOKEN) {
  if (!token) return null;
  try {
    const data = JSON.parse(fs.readFileSync(runSnapshotPath(), 'utf8'));
    if (data && data.token === token && Array.isArray(data.ids)) {
      return new Set(data.ids.map(String));
    }
  } catch {
    // missing or broken file: no snapshot
  }
  return null;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Run one command of admin/BBjAdminTool.java. The args are passed as an array, never through a
 * shell. register-many and unregister may need minutes (about 63 apps), so callers raise
 * timeoutMs for them.
 * -> { code, lines, stderr } for exit codes 0, 2 and 3; rejects on every other exit code.
 */
export async function runAdmin(command, args = [], { timeoutMs = 90000 } = {}) {
  const argv = ['-cp', `${bbjHome()}/.lib/*`, adminToolPath, envFile(), command, ...args];
  return new Promise((resolve, reject) => {
    const child = spawn(javaBin(), argv, { shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const out = [];
    const err = [];
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(value);
    };
    const timer = setTimeout(() => {
      child.kill();
      finish(reject, new Error(`admin ${command} timed out after ${timeoutMs} ms`));
    }, timeoutMs);
    child.stdout.on('data', (chunk) => out.push(chunk));
    child.stderr.on('data', (chunk) => err.push(chunk));
    child.on('error', (e) => finish(reject, new Error(`admin ${command} could not start: ${e.message}`)));
    child.on('close', (code) => {
      const stdout = Buffer.concat(out).toString('utf8');
      const stderr = Buffer.concat(err).toString('utf8');
      const lines = stdout.split(/\r?\n/).filter((l) => l.length > 0);
      if (code === 0 || code === 2 || code === 3) {
        finish(resolve, { code, lines, stderr });
        return;
      }
      const marked = lines.find((l) => l.startsWith('ERROR') || l.startsWith('USAGE'));
      const firstStderr = stderr.split(/\r?\n/).find((l) => l.length > 0);
      finish(reject, new Error(`admin ${command} failed (exit ${code}): ${marked || firstStderr || 'no output'}`));
    });
  });
}

/** Licenses and BBj sessions: { licenses, processes } (see parseStatus). */
export async function status() {
  return parseStatus((await runAdmin('status')).lines);
}

/**
 * Register DWC apps (console allowed, BUI off). apps: [{ name, program, workdir }] with absolute
 * paths. Programs that do not exist are reported as failures and not registered.
 * -> { urls, failures }
 */
export async function registerMany(apps) {
  if (!apps.length) return { urls: {}, failures: [] };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'courses-register-'));
  try {
    const rows = apps.map((a) => {
      const fields = [a.name, toPosix(a.program), toPosix(a.workdir)];
      for (const f of fields) {
        if (/[\t\r\n]/.test(f)) throw new Error(`app field with a tab or line break: ${a.name}`);
      }
      return fields.join('\t');
    });
    const tsv = path.join(dir, 'apps.tsv');
    fs.writeFileSync(tsv, `${rows.join('\n')}\n`, 'utf8');
    return parseRegister((await runAdmin('register-many', [tsv], { timeoutMs: 300000 })).lines);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Registered apps whose name starts with prefix: [{ name, program }]. */
export async function listApps(prefix = 'courses-') {
  return parseApps((await runAdmin('apps', [prefix])).lines);
}

/** Remove every app whose name starts with prefix (only courses-* is accepted). -> removed names */
export async function unregister(prefix = 'courses-') {
  const res = await runAdmin('unregister', [prefix], { timeoutMs: 300000 });
  if (res.code === 3) throw new Error(`admin unregister refused prefix ${prefix}: only courses-* may be removed`);
  const removed = [];
  for (const line of res.lines) {
    const m = line.match(/^REMOVED (\S+)$/);
    if (m) removed.push(m[1]);
  }
  return removed;
}

/** Terminate the BBj sessions with these ids. -> terminated ids; no call for an empty list. */
export async function killIds(ids) {
  if (!ids || !ids.length) return [];
  const res = await runAdmin('killids', [ids.join(',')]);
  const done = [];
  for (const line of res.lines) {
    const m = line.match(/^TERMINATED (\S+)$/);
    if (m) done.push(m[1]);
  }
  return done;
}

/**
 * Session snapshot at the start of a run, written for this lock token. Every lock owner calls it
 * right after a non-reentrant acquireLock and before its first sweep, so `<initializing>`
 * sessions that existed before the run are never touched. -> Set of session ids
 */
export async function takeRunSnapshot(token) {
  const { processes } = await status();
  const ids = processes.map((p) => p.id);
  fs.writeFileSync(runSnapshotPath(), JSON.stringify({ token, ids, takenAt: new Date().toISOString() }), 'utf8');
  return new Set(ids);
}

async function terminateHarness(processes, knownIds) {
  const roots = harnessRoots();
  const victims = processes.filter((p) => isHarnessSession(p, { roots, knownIds }));
  return killIds(victims.map((p) => p.id));
}

/** Terminate every harness session (see isHarnessSession) and nothing else. -> terminated ids */
export async function sweep({ knownIds = readRunSnapshot() } = {}) {
  const { processes } = await status();
  return terminateHarness(processes, knownIds);
}

/**
 * Wait until a license of the feature is free, sweeping harness sessions while waiting.
 * -> true when inUse < total, false on timeout
 */
export async function waitForLicense({ feature = 'BBJ', timeoutMs = 60000, pollMs = 3000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const { licenses, processes } = await status();
    const lic = licenses[feature];
    if (lic && lic.inUse < lic.total) return true;
    if (Date.now() >= deadline) return false;
    await terminateHarness(processes, readRunSnapshot());
    await sleep(pollMs);
  }
}

/** Scan a file for the admin password. -> 'CLEAN' or ['BBJ_ADMIN_PASSWORD'] (names only) */
export async function scanForSecrets(file) {
  const { lines } = await runAdmin('scan', [file]);
  const leaks = [];
  for (const line of lines) {
    const m = line.match(/^LEAK (\S+)$/);
    if (m) leaks.push(m[1]);
  }
  return leaks.length ? leaks : 'CLEAN';
}
