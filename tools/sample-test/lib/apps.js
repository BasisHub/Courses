// The apps a Playwright run registers: the four control programs and every runnable manifest entry.
// Each App carries what the tests need: where the program lives (absolute POSIX paths), what the
// manifest expects of it, and the DWC app name it is registered under.
import fs from 'node:fs';
import path from 'node:path';
import { bbjUrl, examplesDir, fixturesDir, toPosix } from './paths.js';
import { loadManifest, runnableEntries } from './manifest.js';
import { appName, fixtureAppName } from './names.js';

/**
 * App = { id, name, program, workdir, kind, expect, issues, pages }
 * program and workdir are absolute POSIX paths.
 */

/** Control programs from fixtures/expected.json. id is `fixture/<file>`. */
export function fixtureApps() {
  const expected = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'expected.json'), 'utf8'));
  return Object.keys(expected)
    .sort()
    .map((file) => ({
      id: `fixture/${file}`,
      name: fixtureAppName(file),
      program: toPosix(path.join(fixturesDir, file)),
      workdir: toPosix(fixturesDir),
      kind: expected[file].kind,
      expect: expected[file].expect || {},
      issues: [],
      pages: [],
    }));
}

/** One app per runnable manifest entry (every kind except `class`). id is the manifest id. */
export function sampleApps(manifest = loadManifest()) {
  return runnableEntries(manifest).map((entry) => {
    const program = path.join(examplesDir, ...entry.id.split('/'));
    return {
      id: entry.id,
      name: appName(entry.id),
      program: toPosix(program),
      workdir: toPosix(path.dirname(program)),
      kind: entry.kind,
      expect: entry.expect || {},
      issues: entry.issues || [],
      pages: entry.pages || [],
    };
  });
}

/** Fixtures first, then samples. */
export function allApps() {
  return [...fixtureApps(), ...sampleApps()];
}

/** The app with this id (`fixture/<file>` or a manifest id). Throws for an unknown id. */
export function appById(id) {
  const app = allApps().find((a) => a.id === id);
  if (!app) throw new Error(`unknown app id: ${id}`);
  return app;
}

/** URL of a registered DWC app. */
export function appUrl(name) {
  return `${bbjUrl()}/webapp/${name}`;
}
