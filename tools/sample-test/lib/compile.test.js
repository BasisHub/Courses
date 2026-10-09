// Unit tests for the BBjCpl output parser. The test data under lib/testdata holds compiler output
// copied verbatim from the phase 06.2 spike, so no compiler or BBj server is needed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { parseCompileOutput, isFollowUp, summarizeTypecheck } from './compile.js';

const dataDir = path.join(import.meta.dirname, 'testdata');
const typecheckText = fs.readFileSync(path.join(dataDir, 'bbjcpl-typecheck.txt'), 'utf8');
const syntaxText = fs.readFileSync(path.join(dataDir, 'bbjcpl-syntax.txt'), 'utf8');

function forFile(records, file) {
  return records.filter((r) => r.file === file);
}

test('type-check sample: 25 logical records from 27 lines, nothing left over', () => {
  const { records, other } = parseCompileOutput(typecheckText);
  assert.equal(records.length, 25);
  assert.deepEqual(other, []);
  assert.equal(forFile(records, 'DWC1.bbj').length, 19);
  assert.equal(forFile(records, 'DWCThemer.bbj').length, 3);
  assert.equal(forFile(records, 'Exercise-ConvertToCssFlexbox.bbj').length, 3);
});

test('a single-line record gives severity, message, both line numbers and the statement', () => {
  const { records } = parseCompileOutput(typecheckText);
  const first = records[0];
  assert.equal(first.file, 'DWC1.bbj');
  assert.equal(first.severity, 'warning');
  assert.equal(first.typecheck, true);
  assert.equal(first.message, 'Undeclared variable: wnd!');
  assert.equal(first.compiledLine, 110);
  assert.equal(first.line, 11);
  assert.equal(
    first.statement,
    'wnd! = BBjAPI().openSysGui("X0").addWindow(10,10,450,140,"Hello BBj DWC", $00100083$)',
  );
});

test('the source line is the number in parentheses, not the compiled line number', () => {
  const { records } = parseCompileOutput(typecheckText);
  for (const rec of records) {
    assert.equal(rec.compiledLine, rec.line * 10, `${rec.file}:${rec.line}`);
  }
});

test('a statement keeps its leading indentation and loses trailing whitespace', () => {
  const text = 'A.bbj: type check warning [Undeclared variable: x!] at line 30 (3):     x! = 1   \r\n';
  const { records } = parseCompileOutput(text);
  assert.equal(records.length, 1);
  assert.equal(records[0].statement, '    x! = 1');
});

test('a message with several brackets stays one message', () => {
  const { records } = parseCompileOutput(typecheckText);
  const multi = records.find((r) => r.message.startsWith('Undeclared variable: st!;'));
  assert.ok(multi, 'record with three undeclared variables');
  assert.equal(multi.message, 'Undeclared variable: st!; Undeclared variable: wnd!; Undeclared variable: wnd!');
  assert.equal(multi.line, 18);
});

test('the multi-line Ambiguous record is one record with source line 18', () => {
  const { records } = parseCompileOutput(typecheckText);
  const rec = forFile(records, 'DWCThemer.bbj').find((r) => r.message.includes('Ambiguous'));
  assert.ok(rec, 'Ambiguous record found');
  assert.equal(rec.severity, 'error');
  assert.equal(rec.typecheck, true);
  assert.equal(rec.line, 18);
  assert.equal(rec.compiledLine, 180);
  assert.equal(
    rec.message,
    'No match for method java.nio.file.Paths.get(<undeclared>); Ambiguous signatures <init>(java.lang.String) <init>(byte[])',
  );
  assert.ok(!rec.message.includes('\n'));
  assert.ok(rec.statement.startsWith('theme! = new String('));
  // The next record is the follow-up warning of the same line, not a swallowed continuation line.
  const next = forFile(records, 'DWCThemer.bbj').find((r) => r.severity === 'warning' && r.line === 18);
  assert.ok(next, 'warning for line 18 parsed as its own record');
});

test('isFollowUp: <undeclared> in the message or a message starting with Undeclared variable', () => {
  const base = { file: 'A.bbj', severity: 'error', typecheck: true, compiledLine: 10, line: 1, statement: '' };
  assert.equal(isFollowUp({ ...base, message: 'Cannot assign <undeclared> to BBjString' }), true);
  assert.equal(isFollowUp({ ...base, message: 'No match for method X.get(<undeclared>)' }), true);
  assert.equal(isFollowUp({ ...base, message: 'Undeclared variable: wnd!' }), true);
  assert.equal(
    isFollowUp({ ...base, message: 'Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox' }),
    false,
  );
  assert.equal(isFollowUp({ ...base, message: 'No match for method X.get(BBjString)' }), false);
  assert.equal(isFollowUp({ ...base, message: '' }), false);
});

test('summarizeTypecheck over the DWCThemer records: no findings, follow-ups counted', () => {
  const { records } = parseCompileOutput(typecheckText);
  const s = summarizeTypecheck(forFile(records, 'DWCThemer.bbj'));
  assert.deepEqual(s.findings, []);
  assert.ok(s.undeclared > 0, 'undeclared follow-ups counted');
  assert.equal(s.errors, 1);
  assert.equal(s.warnings, 2);
  assert.equal(s.undeclared, 1);
});

test('summarizeTypecheck over the Exercise-ConvertToCssFlexbox records: three void-autocast findings', () => {
  const { records } = parseCompileOutput(typecheckText);
  const s = summarizeTypecheck(forFile(records, 'Exercise-ConvertToCssFlexbox.bbj'));
  assert.deepEqual(
    s.findings.map((f) => f.line),
    [47, 48, 49],
  );
  for (const f of s.findings) {
    assert.equal(f.severity, 'error');
    assert.ok(f.message.startsWith('Autocast will always fail on assignment from void'), f.message);
    assert.ok(f.statement.includes('.setAttribute("label"'), f.statement);
    assert.deepEqual(Object.keys(f).sort(), ['line', 'message', 'severity', 'statement']);
  }
  assert.equal(s.errors, 3);
  assert.equal(s.warnings, 0);
  assert.equal(s.undeclared, 0);
});

test('summarizeTypecheck over everything: errors equal findings plus follow-ups', () => {
  const { records } = parseCompileOutput(typecheckText);
  const s = summarizeTypecheck(records);
  assert.equal(s.errors, s.findings.length + s.undeclared);
  assert.equal(s.findings.length, 3);
  assert.equal(s.errors + s.warnings, records.length);
});

test('summarizeTypecheck leaves records of other passes out', () => {
  const { records } = parseCompileOutput(syntaxText);
  const s = summarizeTypecheck(records);
  assert.deepEqual(s, { errors: 0, warnings: 0, undeclared: 0, findings: [] });
});

test('syntax error line: one record, source line in parentheses', () => {
  const { records, other } = parseCompileOutput(syntaxText);
  assert.deepEqual(other, []);
  assert.equal(records.length, 1);
  assert.deepEqual(records[0], {
    file: 'bad.bbj',
    severity: 'error',
    typecheck: false,
    message: '',
    compiledLine: 20,
    line: 2,
    statement: 'print "unterminated',
  });
});

test('CRLF input gives the same records as LF input', () => {
  // The files may be checked out with either line ending, so normalise before forcing CRLF.
  const crlf = typecheckText.replace(/\r?\n/g, '\r\n');
  assert.ok(crlf.includes('\r\n'));
  assert.deepEqual(parseCompileOutput(crlf), parseCompileOutput(typecheckText));
  const syntaxCrlf = syntaxText.replace(/\r?\n/g, '\r\n');
  assert.deepEqual(parseCompileOutput(syntaxCrlf), parseCompileOutput(syntaxText));
});

test('clean output (empty or blank lines only) gives no records and nothing in other', () => {
  assert.deepEqual(parseCompileOutput(''), { records: [], other: [] });
  assert.deepEqual(parseCompileOutput('\r\n\r\n  \r\n'), { records: [], other: [] });
});

test('an unparseable non-empty line lands in other', () => {
  const text = `compiler banner line\n${typecheckText}`;
  const { records, other } = parseCompileOutput(text);
  assert.equal(records.length, 25);
  assert.deepEqual(other, ['compiler banner line']);
});

test('a record that never reaches its "at line" tail is not lost: its lines go to other', () => {
  const text = [
    'A.bbj: type check error [No match for method X.get(<undeclared>); Ambiguous signatures <init>(java.lang.String)',
    '<init>(byte[])',
    'B.bbj: type check warning [Undeclared variable: y!] at line 20 (2): y! = 1',
    'C.bbj: type check error [Cut off',
  ].join('\n');
  const { records, other } = parseCompileOutput(text);
  assert.equal(records.length, 1);
  assert.equal(records[0].file, 'B.bbj');
  assert.equal(other.length, 3);
  assert.ok(other[0].startsWith('A.bbj: type check error'));
  assert.equal(other[1], '<init>(byte[])');
  assert.ok(other[2].startsWith('C.bbj: type check error [Cut off'));
});
