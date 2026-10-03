// Patches Prism.languages.bbj from prismjs 1.30. The built-in grammar misses
// several BBj constructs (D-13): backslash string escapes instead of doubled
// quotes, single quotes treated as strings, `not` as an operator, no variable
// suffixes, labels, #fields, hex strings, class names, and a short keyword
// list. Delete this file, the class list and the swizzle wrapper once a
// released prismjs contains these fixes.
//
// No imports on purpose: tools/test-bbj-grammar.js loads this file in Node.
// Every keyword and class name is traced in tools/data/bbj-token-verification.md.

// Duck-typed: the test loads this file in a separate vm realm.
const isRegExp = (value) => Object.prototype.toString.call(value) === '[object RegExp]';

const ADDED_KEYWORDS = ['next', 'to', 'step', 'write', 'open', 'close', 'wait', 'input', 'new', 'auto'];

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function extendBbj(Prism, classes) {
  if (!Prism.languages.bbj) {
    return;
  }

  // (1) Strings: a literal quote is written as two quotes, no backslash escape.
  Prism.languages.bbj.string = {
    pattern: /"(?:[^"]|"")*"/,
    greedy: true,
  };

  // (2) Tokens in front of `number`. insertBefore replaces the grammar object,
  // so re-read Prism.languages.bbj after every call.
  const classPattern = new RegExp(
    '\\b(?:' + classes.map(escapeRegExp).join('|') + ')\\b(?!\\.(?:TRUE|FALSE)\\b)'
  );
  Prism.languages.insertBefore('bbj', 'number', {
    mnemonic: {
      pattern: /'[A-Za-z0-9_]+(?:\([^)]*\))?'/,
      greedy: true,
      alias: 'builtin',
    },
    label: {
      pattern: /(^[ \t]*)[A-Za-z_]\w*(?=:)/m,
      lookbehind: true,
      alias: 'symbol',
    },
    field: {
      pattern: /#[A-Za-z_]\w*[$!%]?/,
      alias: 'variable',
    },
    'hex-string': {
      pattern: /\$[0-9A-Fa-f]*\$/,
      alias: 'number',
    },
    'class-name': classPattern,
  });

  // (3) Variables with $ ! % suffix. They go in front of `keyword`, because the
  // keyword regex ends in \b, which also matches before $ ! %: without this,
  // `list!` or `input$` would split into a keyword and a stray suffix.
  Prism.languages.insertBefore('bbj', 'keyword', {
    variable: /\b[A-Za-z_]\w*[$!%]/,
  });

  // (4) Keywords: live list plus the verified additions (cast stays a function).
  const live = Prism.languages.bbj.keyword;
  const liveRegExp = isRegExp(live) ? live : live.pattern;
  const extended = new RegExp(
    liveRegExp.source.replace(/\)\\b$/, '|' + ADDED_KEYWORDS.join('|') + ')\\b'),
    liveRegExp.flags
  );
  Prism.languages.bbj.keyword = isRegExp(live) ? extended : {...live, pattern: extended};

  // (5) Operators: BBj has no NOT; negation is `!`. and, or, xor stay.
  const op = Prism.languages.bbj.operator;
  const opRegExp = isRegExp(op) ? op : op.pattern;
  const opFixed = new RegExp(opRegExp.source.replace('and|not|or|xor', 'and|or|xor'), opRegExp.flags);
  Prism.languages.bbj.operator = isRegExp(op) ? opFixed : {...op, pattern: opFixed};
}
