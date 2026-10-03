# BBj token verification for the Prism extension

Evidence for docs/src/prism/bbj-extend.js; add a token only after a new MCP check.

Source build: bbj-docs, hosted, docs 2026-09-21, fd516a9d. Primer read first (`bbj://primer`). Checked 2026-10-03.

## String escape

A literal quote inside a string is written as two quotes. Primer gotchas/10 and two_string_worlds/5 (https://documentation.basis.cloud/BASISHelp/WebHelp/usr/Language_Concepts/strings.htm). There is no backslash escape. Prism's base `string` pattern (`(['"])(?:(?!\1|\\).|\\.)*\1`) is wrong on both counts.

## Mnemonics and hex strings

Single ticks delimit mnemonics (`'CS'`, `'BOX'(...)`), optionally followed by a parenthesized parameter list (primer two_string_worlds/5). Hex strings are `$...$` with an even number of hex digits (`$0a$`, `$00090003$`); they must not be tokenized as a `$` variable suffix. The `hex-string` token uses the pattern `/\$[0-9A-Fa-f]*\$/`, alias `number`, inserted before `variable`.

## Labels and fields

A label is an identifier followed by a colon at line start, for example `CHECK_ACCOUNT:` (primer language_concepts/8, https://documentation.basis.cloud/BASISHelp/WebHelp/usr/Language_Concepts/commands_and_statements.htm). A label line may carry `rem` without a semicolon (MCP server instructions, https://documentation.basis.cloud/BASISHelp/WebHelp/commands/rem_verb.htm). `#field`, `#method()`, `#this!` and `#super!` are instance references inside a class (primer java_object_model/6). A trailing comment on a statement needs `; rem` (primer gotchas/2).

## Variable suffixes

`$` string, `!` object, `%` integer (primer language_concepts/7, two_string_worlds/8).

## Keyword additions

Each checked with `bbj_reserved_word`; all `reserved: true`.

| Word | Category | Add to keyword list |
|------|----------|---------------------|
| next | Verbs | yes |
| to | Keywords | yes |
| step | Keywords | yes |
| write | Verbs | yes |
| open | Verbs | yes |
| close | Verbs | yes |
| wait | Verbs | yes |
| input | Verbs | yes |
| new | Keywords | yes |
| auto | Keywords | yes |
| cast | Functions | no: base `function` token already matches `cast(` |

Already in Prism's base list (no change): declare, use, class, classend, method, methodend, methodret, field, interface, interfaceend, if, then, else, endif, fi, while, wend, for, switch, case, swend, goto, gosub, return, print, let, dim, read, process_events, callback, release, end, seterr, setesc, extends, implements, public, private, protected, static, void.

## Operator `not`

Prism's base `operator` includes `not`, but BBj has no `NOT` keyword or function; negation is `!` (primer language_concepts/4, https://documentation.basis.cloud/BASISHelp/WebHelp/commands/_operator_invert_numeric_expression.htm). The local extension removes `not` from `operator`. (`and`, `or`, `xor` stay.)

## Class names

Each verified with `bbj_lookup` (kind class or event). The `class-name` token is an alternation of exactly these 35 names:

BBjAPI, BBjSysGui, BBjControl, BBjWindow, BBjTopLevelWindow, BBjChildWindow, BBjButton, BBjToolButton, BBjMenuButton, BBjStaticText, BBjEditBox, BBjCEdit, BBjInputE, BBjInputN, BBjInputD, BBjListBox, BBjListButton, BBjListEdit, BBjCheckBox, BBjRadioButton, BBjTree, BBjStandardGrid, BBjDataAwareGrid, BBjHtmlView, BBjHtmlEdit, BBjFileChooser, BBjVector, BBjNumber, BBjString, BBjInt, BBjNamespace, BBjTemplatedString, BBjButtonPushEvent, BBjFormValidationEvent, BBjNativeJavaScriptEvent

BBjInt resolves via the BBj API signature `com.basis.bbj.proxies.BBjInt`, not a citable page.

Not BBj classes in this docs build (do not list): BBjGridExWidget (a plugin library), BBjPanel, BBjDocViewer, BBjWebManager, BBjBuiManager.

The list lives in `docs/src/prism/bbj-classes.json` with the header field `"source": "bbj-docs hosted 2026-09-21 fd516a9d, verified 2026-10-03"`. Adding a name later requires a new `bbj_lookup`.

## Pre-verified fixture snippet

`bbj_check_syntax`: "No errors found", stock BBj 26.03. `tools/test-bbj-grammar.js` uses exactly this program. It covers `use`, `declare`, `!`/`$`/`%` variables, the `""` escape, a `'CS'` mnemonic, `for ... to ... step` / `next`, `new`, `; rem`, `gosub`, a label, `release`, `class`/`field`/`method`/`methodret`/`methodend`/`classend` and `#field`.

```bbj
use java.util.HashMap

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
```

Expected tokens: `msg$`, `total!`, `count%`, `counter!` are variables; `"She said ""hi"" to me"` is one string token; `'CS'` is a mnemonic; `done` on `done:` is a label; `#count` is a field; `BBjNumber` is a class-name; `rem show the count` is a comment; `to`, `step`, `next`, `new`, `for`, `gosub`, `release`, `class`, `method`, `methodret` are keywords.
