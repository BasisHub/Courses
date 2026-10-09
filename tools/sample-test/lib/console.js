// Parser for the WebCUI console text that DWC shows after an error, END or
// STOP. The console header carries the BBj license serial number, so every
// function here either separates the header from the body or redacts the
// serial before text can reach results or reports.

/** Lines that belong to the console header, not to program output. */
export const HEADER_PATTERNS = [
  /^BBj WebCUI Console/i,
  /^Server BBj Version/i,
  /^Client BBj Version/i,
  /serial/i,
  /licen[cs]e/i,
  /^Copyright/i,
  /^BASIS/i,
];

const SERIAL_PATTERN = /BBX\d{6}/g;
const ERROR_LINE = /^!ERROR=(\d+)\s*(?:\((.*)\))?\s*$/;
const ERROR_IN_TEXT = /!ERROR=(\d+)\s*(?:\((.*)\))?\s*$/;
const STATEMENT_LINE = /^\[(\d+)\]\s?(.*)$/;
const SERVER_VERSION = /^Server BBj Version:\s*(.*)$/i;

/**
 * Replaces every license serial number with '<serial>'.
 * @param {string} text
 * @returns {string}
 */
export function redact(text) {
  return String(text).replace(SERIAL_PATTERN, '<serial>');
}

/**
 * Joins xterm rows into logical lines: a row that xterm marked as wrapped is
 * appended to the row before it.
 * @param {Array<{ text: string, wrapped: boolean }>} rows
 * @returns {string[]}
 */
export function joinWrapped(rows) {
  const lines = [];
  for (const row of rows) {
    if (row.wrapped && lines.length > 0) {
      lines[lines.length - 1] += row.text;
    } else {
      lines.push(row.text);
    }
  }
  return lines;
}

function isHeaderLine(line) {
  return HEADER_PATTERNS.some((pattern) => pattern.test(line));
}

// The header ends at the first empty line after line 0. When that empty line
// is really the one before READY (no separator after the header), the
// candidate header would contain an error line; then the header is the run of
// leading lines that match HEADER_PATTERNS instead.
function splitHeader(lines) {
  let separator = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '') {
      separator = i;
      break;
    }
  }
  if (separator !== -1 && !lines.slice(0, separator).some((l) => ERROR_LINE.test(l.trim()))) {
    return { header: lines.slice(0, separator), body: lines.slice(separator + 1) };
  }
  let count = 0;
  while (count < lines.length && isHeaderLine(lines[count])) count += 1;
  return { header: lines.slice(0, count), body: lines.slice(count) };
}

/**
 * @typedef {{ code: number, message: string, line: number|null, statement: string|null }} BbjError
 */

/**
 * Splits console lines into header and body and reads errors, printed output,
 * the READY prompt and the server version. The serial is redacted up front, so
 * nothing in the result carries it.
 * @param {string[]} lines
 * @returns {{ header: string[], body: string[], errors: BbjError[], printed: string[], ready: boolean, bbjVersion: string|null }}
 */
export function parseConsole(lines) {
  const { header, body } = splitHeader(lines.map(redact));

  const errors = [];
  const consumed = new Set();
  for (let i = 0; i < body.length; i += 1) {
    const match = ERROR_LINE.exec(body[i].trim());
    if (!match) continue;
    consumed.add(i);
    const error = { code: Number(match[1]), message: match[2] ?? '', line: null, statement: null };
    let next = i + 1;
    while (next < body.length && body[next].trim() === '') next += 1;
    if (next < body.length) {
      const statement = STATEMENT_LINE.exec(body[next].trim());
      if (statement) {
        error.line = Number(statement[1]);
        error.statement = statement[2];
        consumed.add(next);
      }
    }
    errors.push(error);
  }

  const printed = body.filter(
    (line, i) => !consumed.has(i) && line.trim() !== '' && line.trim() !== 'READY',
  );
  const ready = body.some((line) => line.trim() === 'READY');

  let bbjVersion = null;
  for (const line of header) {
    const match = SERVER_VERSION.exec(line.trim());
    if (match && match[1].trim() !== '') {
      bbjVersion = match[1].trim();
      break;
    }
  }

  return { header, body, errors, printed, ready, bbjVersion };
}

/**
 * Reads BBj errors from dialog text such as '!ERROR=12 (Missing file C:/x.bbj)'.
 * Dialogs carry no line number, so line and statement are null.
 * @param {string} text
 * @returns {BbjError[]}
 */
export function parseErrorText(text) {
  const errors = [];
  for (const line of String(text ?? '').split(/\r?\n/)) {
    const match = ERROR_IN_TEXT.exec(line);
    if (match) {
      errors.push({
        code: Number(match[1]),
        message: redact(match[2] ?? ''),
        line: null,
        statement: null,
      });
    }
  }
  return errors;
}

/**
 * The part of the console worth keeping in a report: body lines from the first
 * non-empty line on, redacted, without header-like lines, at most max lines.
 * @param {{ body: string[] }|null} parsed
 * @param {number} [max]
 * @returns {string[]}
 */
export function consoleExcerpt(parsed, max = 20) {
  if (!parsed || !Array.isArray(parsed.body)) return [];
  const start = parsed.body.findIndex((line) => line.trim() !== '');
  if (start === -1) return [];
  const kept = [];
  for (const line of parsed.body.slice(start)) {
    if (/serial\s+number/i.test(line) || isHeaderLine(line)) continue;
    kept.push(redact(line));
  }
  const excerpt = kept.slice(0, max);
  while (excerpt.length > 0 && excerpt[excerpt.length - 1].trim() === '') excerpt.pop();
  return excerpt;
}
