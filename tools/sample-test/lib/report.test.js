import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SECTIONS, NOTE_SECTIONS, renderReport, checkReportText, splitNotes, escapeCell } from './report.js';
import { ISSUES } from './manifest.js';
import { IGNORED } from './classify.js';

const dataDir = path.join(import.meta.dirname, 'testdata', 'report');
const harnessDir = path.resolve(import.meta.dirname, '..');

const readJson = (...parts) => JSON.parse(fs.readFileSync(path.join(dataDir, ...parts), 'utf8'));
const readDir = (sub) =>
  fs
    .readdirSync(path.join(dataDir, sub))
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => readJson(sub, f));

function input(over = {}) {
  return structuredClone({
    manifest: readJson('manifest.json'),
    issues: ISSUES,
    compile: readJson('compile.json'),
    samples: readDir('samples'),
    selftest: readDir('selftest'),
    behaviour: readDir('behaviour'),
    run: readJson('run.json'),
    baseline: readJson('baseline.json'),
    notes: fs.readFileSync(path.join(dataDir, 'notes.md'), 'utf8'),
    generatedAt: '2026-10-09T09:00:00.000Z',
    ...over,
  });
}

// Text of one `## <name>` section, up to the next H2 heading.
function section(text, name) {
  const lines = text.split('\n');
  const start = lines.indexOf(`## ${name}`);
  assert.notEqual(start, -1, `missing section ${name}`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith('## ')) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join('\n');
}

// Data rows (without header and separator) of the first table in a text.
function tableRows(text) {
  const lines = text.split('\n');
  const first = lines.findIndex((l) => l.startsWith('|'));
  assert.notEqual(first, -1, 'no table found');
  const rows = [];
  for (let i = first + 2; i < lines.length && lines[i].startsWith('|'); i += 1) rows.push(lines[i]);
  return rows;
}

const cells = (row) => row.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim());

const sampleOf = (data, suffix) => data.samples.find((s) => s.id.endsWith(suffix));

const SERIAL = 'BBX' + '123456';
const LABEL = 'Serial ' + 'Number: ';

test('escapeCell escapes pipes, flattens newlines, trims and caps the length', () => {
  assert.equal(escapeCell('a|b\nc'), 'a\\|b c');
  assert.equal(escapeCell('  padded  '), 'padded');
  assert.equal(escapeCell('x\r\ny'), 'x y');
  assert.equal(escapeCell(null), '');
  const long = escapeCell('x'.repeat(300));
  assert.equal(long.length, 160);
  assert.ok(long.endsWith('...'));
  assert.equal(escapeCell('y'.repeat(160)), 'y'.repeat(160));
});

test('splitNotes reads the four sections and ignores text before the first H2', () => {
  const notes = splitNotes(fs.readFileSync(path.join(dataDir, 'notes.md'), 'utf8'));
  assert.deepEqual(Object.keys(notes), NOTE_SECTIONS);
  assert.match(notes['Static findings'], /^- `DWC2\.bbj` line 35/);
  assert.match(notes['Static findings'], /### Sub-heading inside a note section/);
  assert.match(notes['Draft issues'], /^### Draft: component is not ready on DWC2/);
  assert.match(notes['Questions for Hyyan'], /^1\. Does the license model/);
  assert.match(notes.Notes, /^The license-leak result on DWC2/);
  assert.doesNotMatch(JSON.stringify(notes), /Synthetic notes for the report tests/);
});

test('splitNotes gives empty strings for missing sections and throws on any other H2', () => {
  const notes = splitNotes('## Draft issues\n\ntext\n');
  assert.equal(notes['Static findings'], '');
  assert.equal(notes['Draft issues'], 'text');
  assert.equal(splitNotes('').Notes, '');
  assert.throws(() => splitNotes('## Other\n\nx\n'), /Other/);
  assert.throws(() => splitNotes('## Notes\na\n## Notes\nb\n'), /twice|duplicate/i);
});

test('splitNotes does not treat a heading inside a code fence as a section', () => {
  const notes = splitNotes('## Notes\n\n```text\n## Other\n```\n');
  assert.match(notes.Notes, /## Other/);
});

test('renderReport has every section heading, in order', () => {
  const text = renderReport(input());
  assert.deepEqual(SECTIONS, [
    'Summary',
    'Results per sample',
    'Issues #3 to #7',
    'Findings per sample',
    'Type-check findings',
    'Static findings',
    'Draft issues',
    'Questions for Hyyan',
    'Harness notes',
  ]);
  const headings = text.split('\n').filter((l) => l.startsWith('## '));
  assert.deepEqual(headings, SECTIONS.map((s) => `## ${s}`));
  assert.match(text, /^# Sample test report: BBj 26\.03 baseline\n/);
  assert.match(text, /DWC only, Chromium only \(D-01, D-02\)/);
  assert.match(text, /nothing was posted to GitHub \(D-04\)/);
  assert.match(text, /BBj version 26\.03 \(synthetic\)/);
  assert.match(text, /Chromium 140\.0\.7339\.16/);
  assert.match(text, /Playwright 1\.64\.0/);
  assert.match(text, /not committed because the console header shows the license serial number/);
});

test('Results per sample has one row per manifest entry, in manifest order', () => {
  const text = renderReport(input());
  const rows = tableRows(section(text, 'Results per sample'));
  assert.equal(rows.length, 4);
  const manifest = readJson('manifest.json');
  rows.forEach((row, i) => assert.equal(cells(row)[0], `\`${manifest.entries[i].id}\``));
  assert.match(rows[2], /via intro-bbj\/oo-samples\/CarApplication\.bbj/);
  assert.equal(cells(rows[2])[1], 'class');
  assert.equal(cells(rows[1])[4], 'fail');
  assert.equal(cells(rows[3])[4], 'pass');
});

test('Results per sample fills compile, type check, errors, behaviour and issue cells', () => {
  const text = renderReport(input());
  const rows = tableRows(section(text, 'Results per sample')).map(cells);
  const [dwc2, sample, , car] = rows;
  assert.equal(sample[2], 'ok');
  assert.equal(sample[3], '0 / 0');
  assert.match(sample[5], /!ERROR=12 Missing file Sample\.css at line 16: css! = \.\.\./);
  assert.match(sample[5], /\(\+2 more\)$/);
  assert.equal(sample[6], '0 pass, 0 fail, 1 blocked');
  assert.equal(sample[7], '[#3](https://github.com/BasisHub/Courses/issues/3)');
  assert.equal(dwc2[6], 'none');
  assert.equal(dwc2[7], '[#4](https://github.com/BasisHub/Courses/issues/4)');
  assert.match(dwc2[5], /e\.componentOnReady is not a function/);
  assert.doesNotMatch(dwc2[5], /more/);
  assert.equal(car[3], '1 / 2');
});

test('a manifest entry without a result says not run, and a syntax error shows in the compile cell', () => {
  const data = input();
  data.samples = data.samples.filter((s) => !s.id.endsWith('/DWC2.bbj'));
  data.compile.files[0].syntax = { ok: false, messages: ['error at line 3 (1)', 'error at line 9 (1)'] };
  data.compile.files = data.compile.files.filter((f) => !f.id.endsWith('/Sample.bbj'));
  const text = renderReport(data);
  const rows = tableRows(section(text, 'Results per sample')).map(cells);
  assert.equal(rows.length, 4);
  assert.equal(rows[0][4], 'not run');
  assert.equal(rows[0][2], 'syntax errors: 2');
  assert.equal(rows[1][2], 'n/a');
  assert.equal(rows[1][3], 'n/a');
  // A syntax error is a finding, even when the program has no run result.
  assert.match(section(text, 'Findings per sample'), /### dwc\/01_GUI2BUI2DWC\/DWC2\.bbj/);
});

test('Summary counts come from the results', () => {
  const text = renderReport(input());
  const rows = Object.fromEntries(tableRows(section(text, 'Summary')).map((r) => cells(r)));
  assert.equal(rows['Files under docs/examples'], '4');
  assert.equal(rows['Runnable programs'], '3');
  assert.equal(rows['Smoke pass'], '1');
  assert.equal(rows['Smoke fail'], '2');
  assert.equal(rows['Smoke blocked'], '0');
  assert.equal(rows['Behaviour pass'], '0');
  assert.equal(rows['Behaviour fail'], '0');
  assert.equal(rows['Behaviour blocked'], '1');
  assert.equal(rows['Files with syntax errors'], '0');
  assert.equal(rows['Files with type-check findings'], '1');
  assert.equal(rows['Type-check findings'], '1');
  assert.equal(rows['Self-test controls as expected'], '1 of 4');
  assert.equal(rows['Harness failures from baseline'], 'none');
});

test('Summary reports unrun programs and baseline harness failures', () => {
  const data = input();
  data.samples = data.samples.slice(0, 1);
  data.baseline.harnessFailures = ['global setup: register-many failed'];
  const text = renderReport(data);
  const rows = Object.fromEntries(tableRows(section(text, 'Summary')).map((r) => cells(r)));
  assert.equal(rows['Runnable programs'], '3 (2 not run)');
  assert.match(rows['Harness failures from baseline'], /global setup: register-many failed/);
  assert.match(section(text, 'Harness notes'), /global setup: register-many failed/);
  const noBaseline = renderReport(input({ baseline: null }));
  const noRows = Object.fromEntries(tableRows(section(noBaseline, 'Summary')).map((r) => cells(r)));
  assert.equal(noRows['Harness failures from baseline'], 'not recorded');
});

test('Issues section links every issue and lists behaviour tests', () => {
  const text = renderReport(input());
  const issues = section(text, 'Issues #3 to #7');
  for (const n of [3, 4, 5, 6, 7]) assert.match(issues, new RegExp(`### #${n}: `));
  const three = issues.split('### #4: ')[0].split('### #3: ')[1];
  assert.match(three, /https:\/\/github\.com\/BasisHub\/Courses\/issues\/3/);
  assert.match(three, /`dwc\/01_GUI2BUI2DWC\/DWC_ExternalCSS\/Sample\.bbj`, line 18/);
  const row = tableRows(three).map(cells)[0];
  assert.equal(row[0], 'app-style');
  assert.equal(row[2], 'blocked (start)');
  assert.match(row[3], /sample did not start: !ERROR=12 at line 16/);
  const four = issues.split('### #4: ')[1].split('### #5: ')[0];
  assert.match(four, /no test recorded/);
  assert.doesNotMatch(four, /\| Test \|/);
  const six = issues.split('### #6: ')[1].split('### #7: ')[0];
  assert.match(six, /lines 30, 31, 32, 35, 36, 37/);
});

test('Findings per sample shows the console excerpt in a text fence and the page error', () => {
  const text = renderReport(input());
  const findings = section(text, 'Findings per sample');
  const sample = findings.split('### ').find((b) => b.startsWith('dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj'));
  assert.ok(sample, 'Sample.bbj block');
  assert.match(sample, /```text\n!ERROR=12  \(Missing file Sample\.css\)\n\[16\] css! = \.\.\.\n```/);
  assert.match(sample, /- BBj errors: `!ERROR=12 Missing file Sample\.css at line 16: css! = \.\.\.`/);
  assert.match(sample, /- Network \(local\): `404 http:\/\/localhost:8888\/webapp\/courses-dwc-01-dwc-externalcss-sample\/Sample\.css`/);
  assert.match(sample, /- Network \(external\): `net::ERR_NAME_NOT_RESOLVED https:\/\/cdn\.example\.test\/x\.js`/);
  assert.doesNotMatch(sample, /ok\.js/);
  assert.match(sample, /- Icons: 2\/3 rendered; missing `tabler:missing-icon`/);
  assert.match(sample, /- Warnings: `console-warning: Lit is in dev mode`/);
  assert.match(sample, /- Behaviour: `app-style` \(issue #3\) blocked \(start\): `sample did not start: !ERROR=12 at line 16`/);
  assert.match(sample, /- Screenshots \(local only\): `results\/screenshots\/courses-dwc-01-dwc-externalcss-sample-light\.png`/);
  assert.match(sample, /- Pages: `docs\/docs\/dwc\/01-gui-to-bui-to-dwc\/03-gui-to-bui-to-dwc\.md`/);
  const dwc2 = findings.split('### ').find((b) => b.startsWith('dwc/01_GUI2BUI2DWC/DWC2.bbj'));
  assert.ok(dwc2, 'DWC2.bbj block');
  assert.match(dwc2, /- Page errors: `e\.componentOnReady is not a function`/);
  assert.doesNotMatch(dwc2, /```text/);
});

test('a passing sample without findings and a class entry get no findings block', () => {
  const data = input();
  data.compile.files.find((f) => f.id.endsWith('CarApplication.bbj')).typecheck.findings = [];
  const text = renderReport(data);
  const findings = section(text, 'Findings per sample');
  assert.doesNotMatch(findings, /### intro-bbj\/oo-samples\/CarApplication\.bbj/);
  assert.doesNotMatch(findings, /### intro-bbj\/oo-samples\/Car\.bbj/);
  // With the type-check finding in place, the passing program gets a block.
  const withFinding = section(renderReport(input()), 'Findings per sample');
  assert.match(withFinding, /### intro-bbj\/oo-samples\/CarApplication\.bbj/);
  assert.match(withFinding, /- Type check: .*void method result assigned to a variable/);
});

test('Type-check findings lists the finding and the follow-up count per file', () => {
  const text = renderReport(input());
  const typecheck = section(text, 'Type-check findings');
  const [finding] = tableRows(typecheck).map(cells);
  assert.equal(finding[0], '`intro-bbj/oo-samples/CarApplication.bbj`');
  assert.equal(finding[1], '12');
  assert.match(finding[2], /void method result assigned to a variable \(autocast\)/);
  assert.equal(finding[3], '`car! = fleet!.addCar(c!)`');
  const followUps = typecheck.split('| Undeclared follow-ups |')[1];
  assert.match(followUps, /`intro-bbj\/oo-samples\/CarApplication\.bbj` \| 2 \|/);
  assert.doesNotMatch(followUps, /DWC2/);
});

test('Harness notes list results with a harness issue, and DWC2 carries a Harness issue bullet', () => {
  const text = renderReport(input());
  const notes = section(text, 'Harness notes');
  const harness = notes.split('Results with harness issues')[1].split('###')[0];
  const [row] = tableRows(harness).map(cells);
  assert.equal(row[0], '`dwc/01_GUI2BUI2DWC/DWC2.bbj`');
  assert.equal(row[1], 'smoke');
  assert.equal(row[2], 'license-leak');
  assert.match(row[3], /77/);
  assert.match(row[3], /`<initializing>`/);
  const dwc2 = section(text, 'Findings per sample').split('### ').find((b) => b.startsWith('dwc/01_GUI2BUI2DWC/DWC2.bbj'));
  assert.match(dwc2, /- Harness issue: license-leak; leaked sessions: .*77.*<initializing>/);
});

test('Harness notes say none without harness issues and list a result blocked by license', () => {
  const clean = input();
  sampleOf(clean, '/DWC2.bbj').harnessIssue = null;
  sampleOf(clean, '/DWC2.bbj').leaked = [];
  const none = section(renderReport(clean), 'Harness notes').split('Results with harness issues')[1].split('###')[0];
  assert.match(none, /\nnone\n/);
  assert.doesNotMatch(none, /\| Result \|/);

  const blocked = input();
  sampleOf(blocked, '/DWC2.bbj').harnessIssue = null;
  sampleOf(blocked, '/DWC2.bbj').leaked = [];
  sampleOf(blocked, '/Sample.bbj').status = 'blocked';
  sampleOf(blocked, '/Sample.bbj').reasons = [{ category: 'license', detail: 'out of licenses' }];
  const listed = section(renderReport(blocked), 'Harness notes').split('Results with harness issues')[1].split('###')[0];
  const [row] = tableRows(listed).map(cells);
  assert.equal(row[0], '`dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj`');
  assert.match(row[2], /blocked by license/);
});

test('Harness notes show the self-test table and the ignored patterns', () => {
  const text = renderReport(input());
  const notes = section(text, 'Harness notes');
  const rows = tableRows(notes.split('Self-test controls')[1]).map(cells);
  assert.deepEqual(rows.map((r) => r[0]), ['known-good', 'known-broken', 'known-print', 'known-missing-css']);
  assert.deepEqual(rows.map((r) => r[1]), ['pass', 'fail', 'pass', 'fail']);
  assert.equal(rows[0][2], 'not run');
  assert.equal(rows[1][2], 'fail');
  assert.match(rows[1][3], /!ERROR=252/);

  const none = notes.split('Ignored noise patterns')[1].split('###')[0];
  const sources = [...IGNORED.consoleErrors, ...IGNORED.pageErrors, ...IGNORED.network].map((r) => r.source);
  if (sources.length === 0) assert.match(none, /\nnone\n/);
  else for (const source of sources) assert.ok(none.includes(source), source);

  const custom = renderReport(input(), { ignored: { consoleErrors: [/favicon\.ico/], pageErrors: [], network: [] } });
  assert.match(section(custom, 'Harness notes'), /favicon\\?\.ico/);
});

test('the control expectations match fixtures/expected.json', () => {
  const expected = JSON.parse(fs.readFileSync(path.join(harnessDir, 'fixtures', 'expected.json'), 'utf8'));
  const text = renderReport(input());
  const rows = tableRows(section(text, 'Harness notes').split('Self-test controls')[1]).map(cells);
  for (const [file, spec] of Object.entries(expected)) {
    const control = file.replace(/\.bbj$/, '');
    const row = rows.find((r) => r[0] === control);
    assert.ok(row, control);
    assert.equal(row[1], spec.classification.status, control);
  }
});

test('notes sections are copied verbatim, a missing section gets the placeholder', () => {
  const text = renderReport(input());
  const notes = splitNotes(fs.readFileSync(path.join(dataDir, 'notes.md'), 'utf8'));
  assert.ok(section(text, 'Static findings').includes(notes['Static findings']));
  assert.ok(section(text, 'Draft issues').includes(notes['Draft issues']));
  assert.ok(section(text, 'Questions for Hyyan').includes(notes['Questions for Hyyan']));
  assert.ok(section(text, 'Harness notes').includes(notes.Notes));

  const empty = renderReport(input({ notes: '' }));
  for (const name of ['Static findings', 'Draft issues', 'Questions for Hyyan']) {
    assert.match(section(empty, name), /_To be written after the baseline run\._/);
  }
});

test('a pipe in a result cannot break a table row', () => {
  const data = input();
  sampleOf(data, '/Sample.bbj').reasons[0].detail = 'a|b <c>';
  const text = renderReport(data);
  const rows = tableRows(section(text, 'Results per sample'));
  for (const row of rows) assert.equal(cells(row).length, 8, row);
  assert.match(rows[1], /`a\\\|b <c>`/);
});

test('checkReportText catches serial numbers, the console header label, em dashes and local paths', () => {
  assert.deepEqual(checkReportText(`x ${SERIAL} y`), ['serial number pattern']);
  assert.deepEqual(checkReportText(`${LABEL}x`), ['serial number label']);
  assert.deepEqual(checkReportText('the console header shows the license serial number'), []);
  assert.deepEqual(checkReportText('a \u2014 b'), ['em dash']);
  assert.deepEqual(checkReportText('see C:/Users/someone/x', { forbidden: ['C:/Users/someone'] }), ['local path']);
  assert.deepEqual(checkReportText('see c:/users/SOMEONE/x', { forbidden: ['C:/Users/someone'] }), ['local path']);
  assert.deepEqual(checkReportText('nothing', { forbidden: ['', 'C:/Users/someone'] }), []);
  assert.deepEqual(checkReportText(`${SERIAL} \u2014`), ['serial number pattern', 'em dash']);
});

test('the rendered synthetic report passes the text checks', () => {
  const text = renderReport(input());
  assert.deepEqual(checkReportText(text, { forbidden: [process.env.USERPROFILE ?? '/nonexistent-home'] }), []);
  assert.ok(text.endsWith('\n'));
  assert.ok(!text.includes('\r'));
  // every code fence carries a language
  const fences = text.split('\n').filter((l) => /^```/.test(l));
  fences.forEach((fence, i) => {
    if (i % 2 === 0) assert.match(fence, /^```[a-z]+$/, fence);
  });
});

test('renderReport rejects an unknown note section', () => {
  assert.throws(() => renderReport(input({ notes: '## Surprise\n\nx\n' })), /Surprise/);
});
