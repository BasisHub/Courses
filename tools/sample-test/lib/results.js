// Result files of a run, all inside the results folder (ignored by git, see resultsDir in paths.js).
//
//   results/samples/<app>.json                  one SampleResult per program (runProgram)
//   results/behaviour/<app>--<test>.json        one BehaviourResult per behaviour test
//   results/console/<app>.txt                   raw WebCUI console text; the header holds the license
//                                               serial number, so this folder is never copied anywhere
//
// Every JSON file passes through redact() on its way to disk, so a serial number cannot reach a result
// file even if a caller forgets to strip it (T-06.2-20).
import fs from 'node:fs';
import path from 'node:path';
import { redact } from './console.js';
import { slug } from './names.js';
import { resultsDir } from './paths.js';

function appName(app) {
  const name = typeof app === 'string' ? app : app && (app.name || app.app || app.id);
  const clean = slug(name || '');
  if (!clean) throw new Error('result file needs an app name');
  return clean;
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${redact(JSON.stringify(value, null, 2))}\n`, 'utf8');
  return file;
}

/**
 * Writes results/<dir>/<app>.json.
 * @param {{ app: string }} result a SampleResult
 * @param {{ dir?: string }} [options]
 * @returns {string} the absolute path written
 */
export function writeSampleResult(result, { dir = 'samples' } = {}) {
  return writeJson(resultsDir(dir, `${appName(result.app ?? result.id)}.json`), result);
}

/**
 * Writes results/<dir>/<app>--<slug(test) cut to 60 chars>.json. The default folder is behaviour;
 * the wrapper self-tests use selftest-behaviour so that control results never mix with sample ones.
 * @param {{ app: string, test: string }} result a BehaviourResult
 * @param {{ dir?: string }} [options]
 * @returns {string} the absolute path written
 */
export function writeBehaviourResult(result, { dir = 'behaviour' } = {}) {
  const test = slug(result.test || 'test').slice(0, 60).replace(/-+$/, '') || 'test';
  return writeJson(resultsDir(dir, `${appName(result.app ?? result.id)}--${test}.json`), result);
}

/**
 * Writes the raw console text to results/console/<app>.txt. The header holds the license serial
 * number, so this is the only place raw console text may go.
 * @param {string|{ name: string }} app
 * @param {string[]} lines
 * @returns {string} the absolute path written
 */
export function writeConsoleRaw(app, lines) {
  const file = resultsDir('console', `${appName(app)}.txt`);
  fs.writeFileSync(file, `${(lines ?? []).join('\n')}\n`, 'utf8');
  return file;
}

/**
 * Parsed JSON of every .json file in results/<dir>, in file name order. A folder that does not exist
 * yet reads as an empty list.
 * @param {string} dir
 * @returns {object[]}
 */
export function readResults(dir) {
  const folder = resultsDir(dir);
  return fs
    .readdirSync(folder)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => JSON.parse(fs.readFileSync(path.join(folder, name), 'utf8')));
}

/**
 * Sets harnessIssue (and any extra keys) on every result file in the list. Used by the bbj fixture
 * to flag results that were written during a test that leaked a license. A file that is missing or
 * unreadable is skipped. Returns the files that were patched.
 * @param {string[]} files absolute paths
 * @param {string} issue for example 'license-leak'
 * @param {object} [extra] for example { leaked: [{ id, program }] }
 * @returns {string[]}
 */
export function markHarnessIssue(files, issue, extra = {}) {
  const patched = [];
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      writeJson(file, { ...data, harnessIssue: issue, ...extra });
      patched.push(file);
    } catch {
      // the test wrote no result file or a broken one: nothing to flag
    }
  }
  return patched;
}
