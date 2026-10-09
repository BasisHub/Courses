// Parser for the output of the local BBj compiler (BBjCpl.exe). Pure: text in, records out, no I/O.
//
// The compiler always exits with 0, so the text is the only result. Two passes produce it:
//   syntax pass    -N -X <file>                              nothing for a clean file; for a syntax
//                                                            error one line:
//     bad.bbj: error at line 20 (2): print "unterminated
//   type-check     -t -N -X -W -c<BBJ_HOME>/cfg/config.bbx   one record per finding:
//     DWC1.bbj: type check warning [Undeclared variable: wnd!] at line 110 (11): wnd! = ...
//     DWC1.bbj: type check error [Cannot assign <undeclared> to BBjString] at line 370 (37): ...
// The first number after "at line" is 10 times the source line; the number in parentheses is the
// source line. A bracketed message can span several lines (ambiguous method signatures), so a
// record ends at the first line that carries the " at line N (M): " tail.

/** A record starts with `<file>.bbj: ` at the beginning of a line. */
const START = /^\S+\.bbj: /;
/** The tail that closes a record. The bracket text of the type-check form ends right before it. */
const TAIL = / at line \d+ \(\d+\): /;
const RECORD = /^(.+?): (type check )?(error|warning)(?: \[([\s\S]*?)\])? at line (\d+) \((\d+)\): (.*)$/;

/**
 * @typedef {object} Rec
 * @property {string} file base name of the compiled file
 * @property {'error'|'warning'} severity
 * @property {boolean} typecheck true for type-check records, false for syntax errors
 * @property {string} message bracket text on one line; '' for syntax errors
 * @property {number} compiledLine 10 times the source line
 * @property {number} line source line, the number in parentheses
 * @property {string} statement source text of that line, without trailing whitespace
 */

/**
 * Parses compiler output. A line starting `<name>.bbj: ` opens a record; the following lines that do
 * not open a record continue it until the " at line N (M): " tail appears. Lines outside a record,
 * and records that never close or do not match the record pattern, are returned in `other` (non-empty
 * lines only) so nothing is lost silently.
 * @param {string} text stdout and stderr of one compiler run
 * @returns {{ records: Rec[], other: string[] }}
 */
export function parseCompileOutput(text) {
  const records = [];
  const other = [];
  let open = null;

  const flushOpenToOther = () => {
    if (open === null) return;
    for (const line of open) {
      if (line.trim() !== '') other.push(line);
    }
    open = null;
  };

  const closeIfComplete = () => {
    if (open === null || !TAIL.test(open.join('\n'))) return;
    const m = RECORD.exec(open.join('\n'));
    if (m) {
      records.push({
        file: m[1],
        severity: m[3],
        typecheck: Boolean(m[2]),
        message: (m[4] ?? '').replace(/\s*\n\s*/g, ' ').trim(),
        compiledLine: Number(m[5]),
        line: Number(m[6]),
        statement: m[7].trimEnd(),
      });
      open = null;
    } else {
      flushOpenToOther();
    }
  };

  for (const line of String(text ?? '').split(/\r?\n/)) {
    if (START.test(line)) {
      flushOpenToOther(); // the previous record never closed
      open = [line];
      closeIfComplete();
    } else if (open !== null) {
      open.push(line);
      closeIfComplete();
    } else if (line.trim() !== '') {
      other.push(line);
    }
  }
  flushOpenToOther(); // input ended inside a record
  return { records, other };
}

/**
 * Follow-ups of an undeclared variable: the type checker cannot know the type, so it reports
 * `Cannot assign <undeclared> to BBjString` and similar on every use. They are review material
 * ("declare your variables"), not findings of their own.
 * @param {Pick<Rec, 'message'>} rec
 * @returns {boolean}
 */
export function isFollowUp(rec) {
  const message = rec?.message ?? '';
  return message.includes('<undeclared>') || message.startsWith('Undeclared variable');
}

/**
 * Summary of one type-check pass. Only type-check records count; a syntax error shows up in the
 * syntax pass.
 *
 * - errors, warnings: all type-check records of that severity
 * - undeclared: error records that are follow-ups (so errors = findings.length + undeclared)
 * - findings: error records that are not follow-ups, for example `Autocast will always fail on
 *   assignment from void to ...BBjEditBox`
 * @param {Rec[]} records
 * @returns {{ errors: number, warnings: number, undeclared: number, findings: Array<{ line: number, severity: 'error'|'warning', message: string, statement: string }> }}
 */
export function summarizeTypecheck(records) {
  let errors = 0;
  let warnings = 0;
  let undeclared = 0;
  const findings = [];
  for (const rec of records ?? []) {
    if (!rec.typecheck) continue;
    if (rec.severity === 'warning') {
      warnings += 1;
      continue;
    }
    errors += 1;
    if (isFollowUp(rec)) {
      undeclared += 1;
    } else {
      findings.push({
        line: rec.line,
        severity: rec.severity,
        message: rec.message,
        statement: rec.statement,
      });
    }
  }
  return { errors, warnings, undeclared, findings };
}
