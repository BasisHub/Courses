// Smoke test for docs/src/prism/bbj-extend.js against the pre-verified snippet
// (tools/data/bbj-token-verification.md). Run: node tools/test-bbj-grammar.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const docsDir = path.join(__dirname, '..', 'docs');
// prismjs is an exact devDependency of docs/ (the same package theme-classic
// loads prism-bbj from), so this resolves without relying on npm hoisting.
const req = (id) => require(require.resolve(id, {paths: [docsDir]}));
const Prism = req('prismjs');
req('prismjs/components/prism-bbj');

const src = fs
  .readFileSync(path.join(docsDir, 'src/prism/bbj-extend.js'), 'utf8')
  .replace(/^export default /m, 'module.exports = ');
const sandbox = {module: {exports: {}}};
vm.runInNewContext(src, sandbox);
const extendBbj = sandbox.module.exports;
const classList = JSON.parse(fs.readFileSync(path.join(docsDir, 'src/prism/bbj-classes.json'), 'utf8'));
extendBbj(Prism, classList.classes);

const snippet = `use java.util.HashMap

declare BBjNumber total!
total! = 0
msg$ = "She said ""hi"" to me"
print 'CS', msg$
count% = 3
for i = 1 to count% step 1
    total! = total! + i
next i
counter! = new Counter()
counter!.add(5)
print counter!.getCount(); rem show the count
gosub done
release

done:
    print "done"
return

class public Counter
    field private BBjNumber count
    method public void add(BBjNumber n)
        #count = #count + n
    methodend
    method public BBjNumber getCount()
        methodret #count
    methodend
classend
`;

const textOf = (c) => (typeof c === 'string' ? c : Array.isArray(c) ? c.map(textOf).join('') : textOf(c.content));

function flat(tokens, out = []) {
  for (const t of tokens) {
    if (typeof t === 'string') continue;
    out.push({type: t.type, text: textOf(t.content)});
    if (Array.isArray(t.content)) flat(t.content, out);
  }
  return out;
}
const toks = flat(Prism.tokenize(snippet, Prism.languages.bbj));
const has = (type, text) => toks.some((t) => t.type === type && t.text.trim() === text);

let failed = 0;
function check(name, ok) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name);
  if (!ok) failed++;
}

for (const v of ['msg$', 'total!', 'count%', 'counter!']) check(`variable ${v}`, has('variable', v));
check('doubled-quote string is one token', has('string', '"She said ""hi"" to me"'));
check("mnemonic 'CS'", has('mnemonic', "'CS'"));
check('label done', has('label', 'done'));
check('field #count', has('field', '#count'));
check('class-name BBjNumber', has('class-name', 'BBjNumber'));
check('comment rem', toks.some((t) => t.type === 'comment' && t.text.trim() === 'rem show the count'));
for (const k of ['to', 'step', 'next', 'new', 'for', 'gosub', 'release', 'class', 'method', 'methodret'])
  check(`keyword ${k}`, has('keyword', k));

const reOf = (x) => (x.pattern ? x.pattern : x);
const kwRe = reOf(Prism.languages.bbj.keyword);
for (const k of ['next', 'to', 'step', 'write', 'open', 'close', 'wait', 'input', 'new', 'auto'])
  check(`keyword regex matches ${k}`, new RegExp(kwRe.source, kwRe.flags.replace('g', '')).test(k));
check('keyword regex does not match cast', !new RegExp(kwRe.source, 'i').test('cast'));

const opRe = new RegExp(reOf(Prism.languages.bbj.operator).source, 'i');
check('operator does not match not', !opRe.test('not'));
for (const o of ['and', 'or', 'xor']) check(`operator matches ${o}`, opRe.test(o));

const hex = Prism.tokenize('x = $0a$', Prism.languages.bbj);
const hexToks = flat(hex);
check('hex-string $0a$', hexToks.some((t) => t.type === 'hex-string' && t.text === '$0a$'));
check('hex-string is not a variable', !hexToks.some((t) => t.type === 'variable'));

// A keyword used as the stem of a suffixed variable stays one variable token.
const stemToks = flat(Prism.tokenize('list! = new BBjVector()\ninput$ = start$ + end$\nto! = 1', Prism.languages.bbj));
for (const v of ['list!', 'input$', 'start$', 'end$', 'to!'])
  check(`variable ${v} with keyword stem`, stemToks.some((t) => t.type === 'variable' && t.text === v));
check('keyword stem is not a keyword', !stemToks.some((t) => t.type === 'keyword' && ['list', 'input', 'start', 'end', 'to'].includes(t.text)));

// Strings and mnemonics never span lines; mnemonic parameters follow the tick.
const lineToks = flat(Prism.tokenize('print "unterminated\nx$ = "a"\nprint \'BOX\'(1,2)', Prism.languages.bbj));
check('string does not cross a line break', !lineToks.some((t) => (t.type === 'string' || t.type === 'mnemonic') && /[\r\n]/.test(t.text)));
check('string "a" on the next line', lineToks.some((t) => t.type === 'string' && t.text === '"a"'));
check("mnemonic 'BOX' before its parameters", lineToks.some((t) => t.type === 'mnemonic' && t.text === "'BOX'"));

const cnRe = new RegExp(reOf(Prism.languages.bbj['class-name']).source);
check('class-name matches BBjVector', cnRe.test('BBjVector'));
check('class-name skips BBjGridExWidget', !cnRe.test('BBjGridExWidget'));
check('class-name skips BBjPanel', !cnRe.test('BBjPanel'));
check('class list has 35 unique entries', classList.classes.length === 35 && new Set(classList.classes).size === 35);

process.exit(failed ? 1 : 0);
