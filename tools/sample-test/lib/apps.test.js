import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allApps, appById, appUrl, fixtureApps, sampleApps } from './apps.js';
import { loadManifest, runnableEntries } from './manifest.js';
import { bbjUrl } from './paths.js';

test('allApps has the four fixtures plus every runnable manifest entry', () => {
  const runnable = runnableEntries(loadManifest()).length;
  const apps = allApps();
  assert.equal(fixtureApps().length, 4);
  assert.equal(sampleApps().length, runnable);
  assert.equal(apps.length, 4 + runnable);
  assert.deepEqual(apps.slice(0, 4).map((a) => a.id), fixtureApps().map((a) => a.id), 'fixtures come first');
});

test('app names are unique and match the courses- name rule', () => {
  const names = allApps().map((a) => a.name);
  assert.equal(new Set(names).size, names.length);
  for (const name of names) assert.match(name, /^courses-[a-z0-9-]+$/, name);
});

test('every program file exists and paths are absolute POSIX', () => {
  for (const app of allApps()) {
    assert.ok(fs.existsSync(app.program), `${app.id}: ${app.program} is missing`);
    assert.ok(fs.statSync(app.workdir).isDirectory(), `${app.id}: workdir is not a folder`);
    assert.ok(!app.program.includes('\\') && !app.workdir.includes('\\'), `${app.id}: backslash in path`);
    assert.match(app.program, /^([A-Za-z]:)?\//, `${app.id}: program is not absolute`);
    assert.match(app.workdir, /^([A-Za-z]:)?\//, `${app.id}: workdir is not absolute`);
    assert.ok(app.program.startsWith(`${app.workdir}/`), `${app.id}: program is not inside workdir`);
  }
});

test('fixture ids start with fixture/ and sample ids do not', () => {
  for (const app of fixtureApps()) assert.ok(app.id.startsWith('fixture/'), app.id);
  for (const app of sampleApps()) assert.ok(!app.id.startsWith('fixture/'), app.id);
  assert.ok(fixtureApps().every((a) => /^courses-fixture-/.test(a.name)));
});

test('fixture apps carry kind and expectations from expected.json', () => {
  const good = appById('fixture/known-good.bbj');
  assert.equal(good.name, 'courses-fixture-known-good');
  assert.equal(good.kind, 'window');
  assert.equal(good.expect.title, 'Courses fixture good');
  assert.deepEqual(good.issues, []);
  assert.deepEqual(good.pages, []);
  assert.ok(good.program.endsWith('/fixtures/known-good.bbj'));
});

test('sample apps carry manifest data and no class entries', () => {
  const apps = sampleApps();
  assert.ok(!apps.some((a) => a.id.endsWith('/Board.bbj')), 'class entries are not registered');
  const dwc1 = appById('dwc/01_GUI2BUI2DWC/DWC1.bbj');
  assert.equal(dwc1.kind, 'window');
  assert.equal(dwc1.expect.title, 'Hello BBj DWC');
  assert.ok(dwc1.pages.length > 0);
  assert.ok(dwc1.program.endsWith('/docs/examples/dwc/01_GUI2BUI2DWC/DWC1.bbj'));
  assert.ok(dwc1.workdir.endsWith('/docs/examples/dwc/01_GUI2BUI2DWC'));
});

test('appById throws for an unknown id', () => {
  assert.throws(() => appById('dwc/no-such.bbj'), /unknown app id/);
});

test('appUrl joins the BBj URL, /webapp/ and the name', () => {
  assert.equal(appUrl('courses-x'), `${bbjUrl()}/webapp/courses-x`);
});
