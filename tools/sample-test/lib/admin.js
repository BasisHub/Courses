// Node side of the BBj administration layer: parsers for the Java tool's output, the rule that
// decides which BBj sessions belong to the harness, and the run-start session snapshot.
// The spawning half (runAdmin and friends) is added below the pure helpers.
import fs from 'node:fs';
import path from 'node:path';
import { harnessRoots, toPosix } from './paths.js';
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
    let m = LICENSE_RE.exec(line);
    if (m) {
      licenses[m[1]] = { total: Number(m[2]), inUse: Number(m[3]) };
      continue;
    }
    m = PROC_RE.exec(line);
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
    let m = URL_RE.exec(line);
    if (m) {
      urls[m[1]] = m[2];
      continue;
    }
    m = FAIL_RE.exec(line);
    if (m) failures.push({ name: m[1], reason: m[2] });
  }
  return { urls, failures };
}

/** APP lines of `apps` -> [{ name, program }] */
export function parseApps(lines) {
  const apps = [];
  for (const raw of lines) {
    const m = APP_RE.exec(stripCr(raw));
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
