// Renders the sample test report (tools/data/sample-test-report.md) from harness results.
// Pure: no file access, no BBj. report.mjs reads the results, calls renderReport, redacts local
// paths and refuses unsafe text. The report is committed, so it must never carry the license
// serial number, the console header or the admin password.
//
// Console text enters the report only as the redacted excerpt that classify() stored in each
// result. Hand-written analysis (static findings, draft issues, questions, notes) comes from
// report-notes.md through splitNotes, so a regeneration never loses it.

import { IGNORED } from './classify.js';
import { makeBehaviourResult, makeSampleResult } from './schema.js';

/** The H2 sections of the report, in order. */
export const SECTIONS = [
  'Summary',
  'Results per sample',
  'Issues #3 to #7',
  'Findings per sample',
  'Type-check findings',
  'Static findings',
  'Draft issues',
  'Questions for Hyyan',
  'Harness notes',
];

/** The H2 sections report-notes.md may contain (each optional, any order). */
export const NOTE_SECTIONS = ['Static findings', 'Draft issues', 'Questions for Hyyan', 'Notes'];

const PLACEHOLDER = '_To be written after the baseline run._';
const MAX_CELL = 160;
// U+2014, built from the code point so this file stays free of the character itself (house rule).
const EM_DASH = String.fromCodePoint(0x2014);

// Expected verdict of each self-test control; mirrors fixtures/expected.json (a unit test checks it).
const CONTROLS = {
  'known-good': 'pass',
  'known-broken': 'fail',
  'known-print': 'pass',
  'known-missing-css': 'fail',
};

/** Makes text safe for one table cell: no newlines, no raw pipes, at most 160 characters. */
export function escapeCell(text) {
  let flat = String(text ?? '').replace(/\s*[\r\n]+\s*/g, ' ').trim();
  if (flat.length > MAX_CELL) flat = `${flat.slice(0, MAX_CELL - 3)}...`;
  return flat.replace(/\|/g, '\\|');
}

// Inline code span; the delimiter is one backtick longer than the longest run inside the text.
function code(text) {
  const flat = String(text ?? '').replace(/\s*[\r\n]+\s*/g, ' ');
  if (flat === '') return '';
  const runs = flat.match(/`+/g) ?? [];
  const longest = runs.reduce((max, run) => Math.max(max, run.length), 0);
  const fence = '`'.repeat(longest + 1);
  return longest > 0 ? `${fence} ${flat} ${fence}` : `${fence}${flat}${fence}`;
}

const codeCell = (text) => code(escapeCell(text));

function row(...columns) {
  return `| ${columns.join(' | ')} |`;
}

function table(header, rows) {
  return [row(...header), row(...header.map(() => '---')), ...rows.map((r) => row(...r))].join('\n');
}

function trimBlankLines(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === '') start += 1;
  while (end > start && lines[end - 1].trim() === '') end -= 1;
  return lines.slice(start, end);
}

/**
 * Splits report-notes.md into its sections. Text before the first H2 is ignored (it is for the
 * author). Throws on an H2 heading that is not in NOTE_SECTIONS and on a repeated section.
 * Headings inside code fences do not count.
 * @param {string} md
 * @returns {{ 'Static findings': string, 'Draft issues': string, 'Questions for Hyyan': string, Notes: string }}
 */
export function splitNotes(md) {
  const out = Object.fromEntries(NOTE_SECTIONS.map((name) => [name, '']));
  const seen = new Set();
  let current = null;
  let buffer = [];
  let fence = null;
  const flush = () => {
    if (current !== null) out[current] = trimBlankLines(buffer).join('\n');
    buffer = [];
  };
  for (const line of String(md ?? '').split(/\r?\n/)) {
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1][0];
      else if (fenceMatch[1][0] === fence) fence = null;
    }
    const heading = fence === null && !fenceMatch ? /^##\s+(.+?)\s*$/.exec(line) : null;
    if (heading) {
      const name = heading[1];
      if (!NOTE_SECTIONS.includes(name)) {
        throw new Error(
          `report notes: unknown section "## ${name}"; allowed sections: ${NOTE_SECTIONS.map((n) => `"## ${n}"`).join(', ')}`,
        );
      }
      if (seen.has(name)) throw new Error(`report notes: section "## ${name}" appears twice`);
      seen.add(name);
      flush();
      current = name;
      continue;
    }
    if (current !== null) buffer.push(line);
  }
  flush();
  return out;
}

/**
 * Problems that must stop a report from being written. forbidden holds strings that must not
 * appear (the home folder), compared case-insensitively.
 * @param {string} text
 * @param {{ forbidden?: string[] }} [options]
 * @returns {string[]}
 */
export function checkReportText(text, { forbidden = [] } = {}) {
  const body = String(text ?? '');
  const problems = [];
  if (/BBX[0-9]{6}/.test(body)) problems.push('serial number pattern');
  // The console header form of the label; prose such as "the license serial number" is allowed.
  if (/serial\s+number\s*:/i.test(body)) problems.push('serial number label');
  if (body.includes(EM_DASH)) problems.push('em dash');
  const lower = body.toLowerCase();
  if (forbidden.some((item) => item && lower.includes(String(item).toLowerCase()))) {
    problems.push('local path');
  }
  return problems;
}

// ---------------------------------------------------------------------------------------------
// Helpers over the results

function normalize(list, make, label) {
  return (list ?? []).map((result) => {
    try {
      return make(result);
    } catch (error) {
      throw new Error(`${label} result ${result?.id ?? '?'}: ${error.message}`);
    }
  });
}

function lastById(list) {
  const map = new Map();
  for (const item of list) map.set(item.id, item);
  return map;
}

function groupById(list) {
  const map = new Map();
  for (const item of list) {
    if (!map.has(item.id)) map.set(item.id, []);
    map.get(item.id).push(item);
  }
  return map;
}

function compileInfo(file) {
  if (!file) return null;
  const messages = file.syntax?.messages ?? [];
  const ok = file.syntax?.ok !== false;
  return {
    id: file.id,
    syntaxOk: ok,
    syntaxMessages: messages,
    syntaxErrors: ok ? 0 : Math.max(messages.length, 1),
    findings: file.typecheck?.findings ?? [],
    undeclared: file.typecheck?.undeclared ?? 0,
  };
}

function failedRequests(result) {
  return (result.network ?? []).filter(
    (entry) => entry.error != null || (typeof entry.status === 'number' && entry.status >= 400),
  );
}

function describeRequest(entry) {
  return `${entry.status ?? entry.error} ${entry.url}`;
}

function describeBbjError(error) {
  let text = `!ERROR=${error.code}${error.message ? ` ${error.message}` : ''}`;
  if (error.line != null) text += ` at line ${error.line}: ${error.statement}`;
  return text;
}

function isLicenseBlocked(result) {
  return (result.reasons ?? []).some((reason) => reason.category === 'license') || result.category === 'license';
}

function leakedText(leaked) {
  return (leaked ?? []).map((l) => `${l.id} ${code(l.program)}`).join(', ');
}

// Result paths are relative to the results folder; the report names them relative to tools/sample-test/.
function localPath(p) {
  const posix = String(p).replace(/\\/g, '/');
  if (/^([A-Za-z]:)?\//.test(posix)) return posix;
  return posix.startsWith('results/') ? posix : `results/${posix}`;
}

function controlName(result) {
  const fromId = String(result.id ?? '').split('/').pop().replace(/\.bbj$/i, '');
  if (Object.hasOwn(CONTROLS, fromId)) return fromId;
  const fromApp = String(result.app ?? '').replace(/^courses-fixture-/, '');
  return Object.hasOwn(CONTROLS, fromApp) ? fromApp : null;
}

function bullet(label, items) {
  if (items.length === 0) return [];
  if (items.length === 1) return [`- ${label}: ${items[0]}`];
  return [`- ${label}:`, ...items.map((item) => `  - ${item}`)];
}

function fenced(lines) {
  const longest = lines.reduce((max, line) => Math.max(max, ...(line.match(/`+/g) ?? []).map((r) => r.length)), 0);
  const fence = '`'.repeat(Math.max(3, longest + 1));
  return [`${fence}text`, ...lines, fence].join('\n');
}

function behaviourItem(b) {
  let text = code(b.test ?? '(unnamed)');
  if (b.issue != null) text += ` (issue #${b.issue})`;
  text += ` ${b.outcome}`;
  if (b.category) text += ` (${b.category})`;
  if (b.evidence) text += `: ${code(b.evidence)}`;
  return text;
}

function behaviourCounts(list) {
  const count = (outcome) => list.filter((b) => b.outcome === outcome).length;
  return `${count('pass')} pass, ${count('fail')} fail, ${count('blocked')} blocked`;
}

// ---------------------------------------------------------------------------------------------
// Report

/**
 * @param {object} input
 * @param {{ entries: object[] }} input.manifest
 * @param {Record<number, { url: string, title: string, file: string, lines: number[], linked: string }>} input.issues
 * @param {object|null} input.compile results/compile.json
 * @param {object[]} input.samples SampleResult[]
 * @param {object[]} input.selftest SampleResult[]
 * @param {object[]} input.behaviour BehaviourResult[]
 * @param {object|null} input.run results/run.json
 * @param {object|null} input.baseline results/baseline.json
 * @param {string|object} input.notes report-notes.md text (or the object splitNotes returns)
 * @param {string} [input.generatedAt]
 * @param {{ ignored?: typeof IGNORED }} [options]
 * @returns {string}
 */
export function renderReport(
  { manifest, issues = {}, compile = null, samples = [], selftest = [], behaviour = [], run = null, baseline = null, notes = '', generatedAt },
  { ignored = IGNORED } = {},
) {
  const entries = manifest?.entries ?? [];
  const sampleList = normalize(samples, makeSampleResult, 'sample');
  const selftestList = normalize(selftest, makeSampleResult, 'self-test');
  const behaviourList = normalize(behaviour, makeBehaviourResult, 'behaviour');
  const sampleById = lastById(sampleList);
  const behaviourById = groupById(behaviourList);
  const compileById = new Map((compile?.files ?? []).map((file) => [file.id, compileInfo(file)]));
  const noteText = typeof notes === 'string' || notes == null ? splitNotes(notes) : { ...splitNotes(''), ...notes };

  const runnable = entries.filter((e) => e.kind !== 'class');
  const ran = runnable.filter((e) => sampleById.has(e.id));
  const notRun = runnable.length - ran.length;
  const bbjVersion = [...selftestList, ...sampleList].map((r) => r.bbjVersion).find((v) => v != null) ?? 'unknown';
  const chromium = run?.chromium ?? baseline?.versions?.chromium ?? 'unknown';
  const playwright = run?.playwright ?? baseline?.versions?.playwright ?? 'unknown';
  const harnessFailures = baseline ? (baseline.harnessFailures ?? []) : null;

  const blocks = [];
  blocks.push('# Sample test report: BBj 26.03 baseline');
  blocks.push(
    `Generated ${generatedAt ?? new Date().toISOString()}. BBj version ${bbjVersion}. Chromium ${chromium}, Playwright ${playwright}. ` +
      'DWC only, Chromium only (D-01, D-02). No sample was changed for this report (D-03) and nothing was posted to GitHub (D-04).',
  );
  blocks.push(
    'Screenshots, raw console text and per-test JSON stay in `tools/sample-test/results/` on the machine that ran the baseline; ' +
      'they are not committed because the console header shows the license serial number.',
  );

  // Summary -------------------------------------------------------------------------------
  const smoke = (status) => ran.filter((e) => sampleById.get(e.id).status === status).length;
  const behaviourCount = (outcome) => behaviourList.filter((b) => b.outcome === outcome).length;
  const compiled = entries.map((e) => compileById.get(e.id)).filter(Boolean);
  const controlsOk = Object.entries(CONTROLS).filter(([name, expected]) => {
    const found = selftestList.find((r) => controlName(r) === name);
    return found !== undefined && found.status === expected;
  }).length;
  let harnessCell = 'not recorded';
  if (harnessFailures) harnessCell = harnessFailures.length === 0 ? 'none' : harnessFailures.map(escapeCell).join('; ');
  blocks.push('## Summary');
  blocks.push(
    table(
      ['Measure', 'Count'],
      [
        ['Files under docs/examples', String(entries.length)],
        ['Runnable programs', notRun > 0 ? `${runnable.length} (${notRun} not run)` : String(runnable.length)],
        ['Smoke pass', String(smoke('pass'))],
        ['Smoke fail', String(smoke('fail'))],
        ['Smoke blocked', String(smoke('blocked'))],
        ['Behaviour pass', String(behaviourCount('pass'))],
        ['Behaviour fail', String(behaviourCount('fail'))],
        ['Behaviour blocked', String(behaviourCount('blocked'))],
        ['Files with syntax errors', String(compiled.filter((c) => !c.syntaxOk).length)],
        ['Files with type-check findings', String(compiled.filter((c) => c.findings.length > 0).length)],
        ['Type-check findings', String(compiled.reduce((sum, c) => sum + c.findings.length, 0))],
        ['Self-test controls as expected', `${controlsOk} of ${Object.keys(CONTROLS).length}`],
        ['Harness failures from baseline', harnessCell],
      ],
    ),
  );

  // Results per sample ----------------------------------------------------------------------
  const resultRows = entries.map((entry) => {
    const result = entry.kind === 'class' ? null : sampleById.get(entry.id);
    const info = compileById.get(entry.id);
    let run_ = 'not run';
    if (entry.kind === 'class') run_ = `via ${entry.entry}`;
    else if (result) run_ = result.status;
    let errors = '';
    if (result && result.reasons.length > 0) {
      errors = codeCell(result.reasons[0].detail);
      if (result.reasons.length > 1) errors += ` (+${result.reasons.length - 1} more)`;
    }
    const tests = behaviourById.get(entry.id) ?? [];
    return [
      code(entry.id),
      entry.kind,
      info ? (info.syntaxOk ? 'ok' : `syntax errors: ${info.syntaxErrors}`) : 'n/a',
      info ? `${info.findings.length} / ${info.undeclared}` : 'n/a',
      escapeCell(run_),
      errors,
      tests.length > 0 ? behaviourCounts(tests) : 'none',
      (entry.issues ?? []).map((n) => (issues[n]?.url ? `[#${n}](${issues[n].url})` : `#${n}`)).join(', '),
    ];
  });
  blocks.push('## Results per sample');
  blocks.push(table(['Sample', 'Kind', 'Compile', 'Type check', 'Run', 'Errors', 'Behaviour', 'Issues'], resultRows));

  // Issues -----------------------------------------------------------------------------------
  blocks.push('## Issues #3 to #7');
  for (const key of Object.keys(issues).map(Number).sort((a, b) => a - b)) {
    const issue = issues[key];
    const lines = issue.lines ?? [];
    const lineText = lines.length === 1 ? `line ${lines[0]}` : `lines ${lines.join(', ')}`;
    const tests = behaviourList.filter((b) => b.issue === key);
    const parts = [
      `### #${key}: ${issue.title}`,
      [
        `- Issue: ${issue.url}`,
        `- Sample: ${code(issue.file)}, ${lineText}`,
        `- Linked to: ${issue.linked}`,
        tests.length === 0 ? '- Behaviour tests: no test recorded.' : '- Behaviour tests:',
      ].join('\n'),
    ];
    if (tests.length > 0) {
      parts.push(
        table(
          ['Test', 'Sample', 'Outcome', 'Evidence'],
          tests.map((b) => [
            escapeCell(b.test ?? ''),
            code(b.id ?? ''),
            escapeCell(b.category ? `${b.outcome} (${b.category})` : b.outcome),
            b.evidence ? codeCell(b.evidence) : '',
          ]),
        ),
      );
    }
    blocks.push(parts.join('\n\n'));
  }

  // Findings per sample ----------------------------------------------------------------------
  blocks.push('## Findings per sample');
  let findingBlocks = 0;
  for (const entry of entries) {
    const isClass = entry.kind === 'class';
    const result = isClass ? null : sampleById.get(entry.id);
    const tests = behaviourById.get(entry.id) ?? [];
    const failedTests = tests.filter((b) => b.outcome !== 'pass');
    const info = compileById.get(entry.id);
    const hasFinding =
      (result && result.status !== 'pass') ||
      failedTests.length > 0 ||
      (info && (info.findings.length > 0 || !info.syntaxOk));
    if (!hasFinding) continue;
    findingBlocks += 1;

    const lines = [];
    const local = result ? failedRequests(result).filter((r) => !r.external) : [];
    const external = result ? failedRequests(result).filter((r) => r.external) : [];
    if (isClass) {
      lines.push(`- Run: via ${entry.entry}`);
    } else if (!result) {
      lines.push('- Run: not run');
    } else {
      const covered = {
        bbj: result.bbjErrors.length > 0,
        page: result.pageErrors.length > 0,
        'console-error': result.consoleErrors.length > 0,
        'network-local': local.length > 0,
        'network-external': external.length > 0,
        icons: (result.icons?.missing ?? []).length > 0,
      };
      let text = `- Run: ${result.status} (start: ${result.start?.state ?? 'unknown'}, ${result.start?.ms ?? 0} ms)`;
      for (const reason of result.reasons) {
        if (!covered[reason.category]) text += `; ${reason.category}: ${code(reason.detail)}`;
      }
      lines.push(text);
      if (result.harnessIssue) {
        const leaked = leakedText(result.leaked);
        lines.push(`- Harness issue: ${result.harnessIssue}${leaked ? `; leaked sessions: ${leaked}` : ''}`);
      }
      lines.push(...bullet('BBj errors', result.bbjErrors.map((e) => code(describeBbjError(e)))));
      lines.push(...bullet('Page errors', result.pageErrors.map((e) => code(e))));
      lines.push(...bullet('Console errors', result.consoleErrors.map((e) => code(e))));
      lines.push(...bullet('Network (local)', local.map((r) => code(describeRequest(r)))));
      lines.push(...bullet('Network (external)', external.map((r) => code(describeRequest(r)))));
      if (result.icons) {
        const missing = (result.icons.missing ?? []).map((icon) => code(`${icon.pool ?? '?'}:${icon.name ?? '?'}`));
        lines.push(
          `- Icons: ${result.icons.rendered}/${result.icons.total} rendered${missing.length ? `; missing ${missing.join(', ')}` : ''}`,
        );
      }
      lines.push(...bullet('Warnings', result.warnings.map((w) => code(`${w.category}: ${w.detail}`))));
    }
    if (info && !info.syntaxOk) {
      lines.push(...bullet('Syntax errors', info.syntaxMessages.map((m) => code(m))));
    }
    if (info && info.findings.length > 0) {
      lines.push(
        ...bullet(
          'Type check',
          info.findings.map((f) => `line ${f.line}, ${f.severity}: ${f.message}, statement ${code(f.statement)}`),
        ),
      );
    }
    if (info && info.undeclared > 0) lines.push(`- Undeclared follow-ups: ${info.undeclared}`);
    lines.push(...bullet('Behaviour', tests.filter((b) => b.outcome !== 'pass').map(behaviourItem)));

    const shots = [];
    if (result?.screenshots?.light) shots.push(code(localPath(result.screenshots.light)));
    if (result?.screenshots?.dark) shots.push(code(localPath(result.screenshots.dark)));
    for (const b of failedTests) if (b.screenshot) shots.push(code(localPath(b.screenshot)));
    if (shots.length > 0) lines.push(`- Screenshots (local only): ${shots.join(', ')}`);
    if ((entry.pages ?? []).length > 0) {
      lines.push(`- Pages: ${entry.pages.map((p) => code(`docs/docs/${p}`)).join(', ')}`);
    }

    const parts = [`### ${entry.id}`, lines.join('\n')];
    if (result && result.consoleExcerpt.length > 0) {
      parts.push('Console excerpt (redacted, from the first error or printed line on):');
      parts.push(fenced(result.consoleExcerpt));
    }
    blocks.push(parts.join('\n\n'));
  }
  if (findingBlocks === 0) blocks.push('No sample has findings.');

  // Type-check findings ----------------------------------------------------------------------
  blocks.push('## Type-check findings');
  const typeFiles = (compile?.files ?? []).map((file) => compileInfo(file));
  const findingRows = typeFiles.flatMap((info) =>
    info.findings.map((f) => [code(info.id), String(f.line), codeCell(`${f.severity}: ${f.message}`), codeCell(f.statement)]),
  );
  blocks.push(findingRows.length > 0 ? table(['File', 'Line', 'Message', 'Statement'], findingRows) : 'No type-check findings.');
  const followUps = typeFiles.filter((info) => info.undeclared > 0);
  if (followUps.length > 0) {
    blocks.push(table(['File', 'Undeclared follow-ups'], followUps.map((info) => [code(info.id), String(info.undeclared)])));
  }

  // Hand-written sections --------------------------------------------------------------------
  for (const name of ['Static findings', 'Draft issues', 'Questions for Hyyan']) {
    blocks.push(`## ${name}`);
    blocks.push(noteText[name] || PLACEHOLDER);
  }

  // Harness notes ----------------------------------------------------------------------------
  blocks.push('## Harness notes');
  blocks.push('### Self-test controls');
  blocks.push(
    table(
      ['Control', 'Expected', 'Observed', 'Reasons'],
      Object.entries(CONTROLS).map(([name, expected]) => {
        const found = selftestList.find((r) => controlName(r) === name);
        if (!found) return [name, expected, 'not run', ''];
        const reasons = found.reasons.map((r) => `${r.category}: ${r.detail}`).join('; ');
        return [
          name,
          expected,
          found.status === expected ? found.status : `${found.status} (unexpected)`,
          reasons ? codeCell(reasons) : '',
        ];
      }),
    ),
  );

  blocks.push('### Results with harness issues');
  const issueRows = [];
  const addIssueRow = (result, testName, license) => {
    const parts = [];
    if (result.harnessIssue) parts.push(result.harnessIssue);
    if (license) parts.push('blocked by license');
    if (parts.length === 0) return;
    issueRows.push([
      code(result.id ?? result.app ?? ''),
      escapeCell(testName),
      escapeCell(parts.join('; ')),
      leakedText(result.leaked),
    ]);
  };
  for (const r of sampleList) addIssueRow(r, 'smoke', isLicenseBlocked(r));
  for (const r of selftestList) addIssueRow(r, 'self-test', isLicenseBlocked(r));
  for (const r of behaviourList) addIssueRow(r, r.test ?? 'behaviour', isLicenseBlocked(r));
  blocks.push(issueRows.length > 0 ? table(['Result', 'Test', 'Issue', 'Leaked sessions'], issueRows) : 'none');

  blocks.push('### Ignored noise patterns');
  const patterns = ['consoleErrors', 'pageErrors', 'network'].flatMap((key) =>
    (ignored[key] ?? []).map((pattern) => `- ${key}: ${code(pattern.source)}`),
  );
  blocks.push(patterns.length > 0 ? patterns.join('\n') : 'none');

  blocks.push('### Baseline harness failures');
  if (harnessFailures === null) blocks.push('not recorded (no baseline.json)');
  else if (harnessFailures.length === 0) blocks.push('none');
  else blocks.push(harnessFailures.map((failure) => `- ${code(failure)}`).join('\n'));

  if (noteText.Notes) {
    blocks.push('### Notes');
    blocks.push(noteText.Notes);
  }

  return `${blocks.join('\n\n')}\n`;
}
