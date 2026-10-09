import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HEADER_PATTERNS,
  joinWrapped,
  parseConsole,
  parseErrorText,
  redact,
  consoleExcerpt,
} from './console.js';

// The serial and the header label are built at runtime so that no file in the
// repository contains a literal serial number or the literal label.
const SERIAL = 'BBX' + '123456';
const LABEL = 'Serial ' + 'Number: ';
// Mirrors the real WebCUI console of BBj 26.03 (confirmed live in plan 06.2-08): seven header lines
// with no blank line after them, then the program output, a blank line, READY and a '>' prompt.
const HEADER = [
  'BBj WebCUI Console',
  'Server BBj Version: REV 26.03',
  'Server Build: 01/02/2026 03:04',
  'Client BBj Version: REV 26.03',
  'Client Build: 01/02/2026 03:04',
  LABEL + SERIAL,
  'Copyright BASIS International Ltd.',
];

const ERROR_LINE = '!ERROR=252  (No match for method jdk.proxy2.$Proxy171.noSuchMethod())';
const ERROR_BODY = [ERROR_LINE, '[4] st!.noSuchMethod()', '', 'READY', '>'];
const PRINT_BODY = ['courses fixture line 1', 'courses fixture line 2', '', 'READY', '>'];
const pad = (line) => line.padEnd(80, ' ');

test('HEADER_PATTERNS matches every line of the synthetic header', () => {
  assert.ok(Array.isArray(HEADER_PATTERNS));
  assert.ok(HEADER_PATTERNS.every((p) => p instanceof RegExp));
  for (const line of HEADER.filter((l) => l !== '')) {
    assert.ok(
      HEADER_PATTERNS.some((p) => p.test(line)),
      `no header pattern matches: ${line.replace(SERIAL, '<serial>')}`,
    );
  }
  assert.ok(!HEADER_PATTERNS.some((p) => p.test('courses fixture line 1')));
});

test('parseConsole reads a BBj error with code, message, line and statement', () => {
  const parsed = parseConsole([...HEADER, ...ERROR_BODY]);
  assert.deepEqual(parsed.errors, [
    {
      code: 252,
      message: 'No match for method jdk.proxy2.$Proxy171.noSuchMethod()',
      line: 4,
      statement: 'st!.noSuchMethod()',
    },
  ]);
  assert.equal(parsed.ready, true);
  assert.deepEqual(parsed.printed, []);
  assert.equal(parsed.bbjVersion, 'REV 26.03');
});

test('parseConsole reads printed lines before READY', () => {
  const parsed = parseConsole([...HEADER, ...PRINT_BODY]);
  assert.deepEqual(parsed.printed, ['courses fixture line 1', 'courses fixture line 2']);
  assert.equal(parsed.ready, true);
  assert.deepEqual(parsed.errors, []);
});

test('parseConsole of a program that is still running has no READY', () => {
  const parsed = parseConsole([...HEADER, 'started']);
  assert.equal(parsed.ready, false);
  assert.deepEqual(parsed.printed, ['started']);
  assert.deepEqual(parsed.errors, []);
});

test('parseConsole ends the header at the copyright line and never leaks the serial', () => {
  const parsed = parseConsole([...HEADER, ...PRINT_BODY]);
  assert.equal(parsed.header.length, 7);
  assert.equal(parsed.header[0], 'BBj WebCUI Console');
  assert.equal(parsed.header[6], 'Copyright BASIS International Ltd.');
  assert.deepEqual(parsed.body, PRINT_BODY);
  const everything = JSON.stringify(parsed);
  assert.ok(!everything.includes(SERIAL), 'serial must not survive parseConsole');
});

test('parseConsole keeps output that follows the header directly, also when it looks like a header line', () => {
  // The real console has no blank line after the header, so the first printed line is body.
  const parsed = parseConsole([...HEADER, 'BASIS license check passed', 'done', '', 'READY', '>']);
  assert.equal(parsed.header.length, 7);
  assert.deepEqual(parsed.printed, ['BASIS license check passed', 'done']);
});

test('parseConsole of a header-only console has an empty body', () => {
  const headerOnly = parseConsole(HEADER);
  assert.equal(headerOnly.header.length, 7);
  assert.deepEqual(headerOnly.body, []);
  assert.equal(headerOnly.ready, false);
  assert.equal(headerOnly.bbjVersion, 'REV 26.03');
});

test('parseConsole reads rows that the console padded to 80 columns', () => {
  const padded = [...HEADER, ...ERROR_BODY].map(pad);
  const parsed = parseConsole(padded);
  assert.equal(parsed.header.length, 7);
  assert.deepEqual(parsed.errors, [
    { code: 252, message: 'No match for method jdk.proxy2.$Proxy171.noSuchMethod()', line: 4, statement: 'st!.noSuchMethod()' },
  ]);
  assert.deepEqual(parsed.printed, []);
  assert.equal(parsed.ready, true);
  assert.equal(parsed.bbjVersion, 'REV 26.03');
  assert.ok(parsed.body.every((line) => line === line.trimEnd()), 'body lines carry no padding');

  const printed = parseConsole([...HEADER, ...PRINT_BODY].map(pad));
  assert.deepEqual(printed.printed, ['courses fixture line 1', 'courses fixture line 2']);
});

test('parseConsole does not count the prompt after READY as program output', () => {
  const parsed = parseConsole([...HEADER, 'courses fixture line 1', '', 'READY', '>']);
  assert.deepEqual(parsed.printed, ['courses fixture line 1']);
  assert.equal(parsed.ready, true);
  // Text after READY is prompt, whatever it is.
  assert.deepEqual(parseConsole([...HEADER, 'a', 'READY', '>', 'typed']).printed, ['a']);
});

test('parseConsole falls back to leading header patterns when there is no copyright line', () => {
  const shortHeader = [HEADER[0], HEADER[1], HEADER[5]];
  const headerOnly = parseConsole(shortHeader);
  assert.equal(headerOnly.header.length, 3);
  assert.deepEqual(headerOnly.body, []);
  assert.equal(headerOnly.ready, false);

  const withError = parseConsole([...shortHeader, ...ERROR_BODY]);
  assert.equal(withError.header.length, 3);
  assert.equal(withError.errors.length, 1);
  assert.equal(withError.errors[0].code, 252);
  assert.equal(withError.errors[0].line, 4);
  assert.deepEqual(withError.printed, []);
});

test('parseConsole reads several errors and keeps a bracket line that is not a statement', () => {
  const parsed = parseConsole([
    ...HEADER,
    '[3] not a statement',
    '!ERROR=12  (Missing file C:/x.bbj)',
    '[7] open (1)"C:/x.bbj"',
    '!ERROR=14',
    '',
    'READY',
  ]);
  assert.deepEqual(parsed.printed, ['[3] not a statement']);
  assert.equal(parsed.errors.length, 2);
  assert.deepEqual(parsed.errors[0], {
    code: 12,
    message: 'Missing file C:/x.bbj',
    line: 7,
    statement: 'open (1)"C:/x.bbj"',
  });
  assert.equal(parsed.errors[1].code, 14);
  assert.equal(parsed.errors[1].line, null);
});

test('parseConsole of nothing returns empty parts', () => {
  const parsed = parseConsole([]);
  assert.deepEqual(parsed.header, []);
  assert.deepEqual(parsed.body, []);
  assert.equal(parsed.ready, false);
  assert.equal(parsed.bbjVersion, null);
});

test('redact masks every serial and leaves other text alone', () => {
  assert.equal(redact('x BBX' + '654321 y'), 'x <serial> y');
  assert.equal(redact('BBX' + '111111 and BBX' + '222222'), '<serial> and <serial>');
  assert.equal(redact('BBX12 not a serial'), 'BBX12 not a serial');
  assert.equal(redact('plain'), 'plain');
});

test('joinWrapped appends wrapped rows to the previous line', () => {
  assert.deepEqual(
    joinWrapped([
      { text: 'abc', wrapped: false },
      { text: 'def', wrapped: true },
      { text: 'g', wrapped: false },
    ]),
    ['abcdef', 'g'],
  );
  assert.deepEqual(
    joinWrapped([
      { text: 'a', wrapped: false },
      { text: 'b', wrapped: true },
      { text: 'c', wrapped: true },
    ]),
    ['abc'],
  );
  assert.deepEqual(joinWrapped([{ text: 'x', wrapped: true }]), ['x']);
  assert.deepEqual(joinWrapped([]), []);
});

test('parseErrorText reads an error from dialog text', () => {
  assert.deepEqual(parseErrorText('Error\n!ERROR=12 (Missing file C:/x.bbj)'), [
    { code: 12, message: 'Missing file C:/x.bbj', line: null, statement: null },
  ]);
});

test('parseErrorText keeps parentheses inside the message and reads CRLF text', () => {
  assert.deepEqual(parseErrorText(`${ERROR_LINE}\r\nmore`), [
    {
      code: 252,
      message: 'No match for method jdk.proxy2.$Proxy171.noSuchMethod()',
      line: null,
      statement: null,
    },
  ]);
});

test('parseErrorText finds an error after other text and returns [] when there is none', () => {
  assert.equal(parseErrorText('Program error: !ERROR=11 (Invalid file)').length, 1);
  assert.deepEqual(parseErrorText('Thin Client Console Error: Program attempted to break to console'), []);
  assert.deepEqual(parseErrorText(''), []);
});

test('consoleExcerpt starts at the error and carries no header or serial', () => {
  const parsed = parseConsole([...HEADER, ...ERROR_BODY]);
  const excerpt = consoleExcerpt(parsed);
  assert.equal(excerpt[0], ERROR_LINE);
  assert.ok(excerpt.some((l) => l.startsWith('[4]')));
  assert.ok(!excerpt.some((l) => /BBX\d{6}/.test(l)));
  assert.ok(!excerpt.some((l) => /serial/i.test(l)));
  assert.ok(!excerpt.some((l) => /^BBj WebCUI Console/.test(l)));
});

test('consoleExcerpt redacts serials, drops header-like lines and honours max', () => {
  const parsed = {
    body: ['', '!ERROR=12 (x)', 'Server BBj Version: REV 26.03', 'hello BBX' + '654321 there', 'a', 'b', 'c', ''],
  };
  assert.deepEqual(consoleExcerpt(parsed), ['!ERROR=12 (x)', 'hello <serial> there', 'a', 'b', 'c']);
  assert.deepEqual(consoleExcerpt(parsed, 2), ['!ERROR=12 (x)', 'hello <serial> there']);
});

test('consoleExcerpt of a print program starts at the first printed line and drops the prompt', () => {
  const parsed = parseConsole([...HEADER, ...PRINT_BODY].map(pad));
  const excerpt = consoleExcerpt(parsed);
  assert.equal(excerpt[0], 'courses fixture line 1');
  assert.equal(excerpt[excerpt.length - 1], 'READY');
  assert.ok(!excerpt.includes('>'));
  assert.ok(!excerpt.some((l) => /serial|copyright|build/i.test(l)));
});

test('consoleExcerpt of null or an empty console is empty', () => {
  assert.deepEqual(consoleExcerpt(null), []);
  assert.deepEqual(consoleExcerpt(parseConsole([])), []);
});
