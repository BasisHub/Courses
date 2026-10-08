import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  KINDS,
  ISSUES,
  listExampleFiles,
  loadManifest,
  coverageDiff,
  validateManifest,
  runnableEntries,
  entryById
} from './manifest.js'

const PANEL = 'wnd!.setPanelStyle("@element", "{}")\n'

let root
let examplesDir
let docsDir

function put(base, rel, text = '') {
  const file = path.join(base, ...rel.split('/'))
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text)
}

function entry(id, over = {}) {
  return {
    id,
    kind: 'window',
    entry: id,
    deps: [],
    external: [],
    pages: ['dwc/page.md'],
    issues: [],
    expect: { title: 'T' },
    notes: '',
    ...over
  }
}

function validManifest() {
  const entries = [
    entry('dwc/01_GUI2BUI2DWC/DWC2.bbj', { issues: [4] }),
    entry('dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj', {
      issues: [3],
      deps: ['dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.css'],
      external: ['https://fonts.googleapis.com', 'prefix:DemoUtils.bbj', 'db:CDStore']
    }),
    entry('dwc/03C_Grid2GridEx/DataRow_and_ResultSet/1_DataRowFromCode.bbj', {
      kind: 'print',
      expect: { print: ['Joe'] }
    }),
    entry('dwc/04_ExtendedAttributes/LabelAttributes.bbj', {
      issues: [5, 7],
      expect: { title: 'Using Label Attributes', startDialog: { button: 'Yes' } }
    }),
    entry('dwc/06_IconPools/DownloadButton.bbj', { issues: [6] }),
    entry('dwc/06_IconPools/Exercise-IconPools.bbj', { kind: 'starter', issues: [6], expect: { title: null } }),
    entry('dwc/06_IconPools/Exercise-IconPoolsComplete.bbj', { issues: [6] }),
    entry('dwc/07_ControlValiation/Exercise-BuiltInValidation.bbj', { kind: 'starter', issues: [7] }),
    entry('dwc/08_BrowserConstraints/MessageBox.bbj', {
      kind: 'dialog',
      expect: { dialog: { title: 'Greetings', text: 'Hello' } }
    }),
    entry('dwc/08_BrowserConstraints/SysPrint.bbj', {
      kind: 'dialog',
      expect: { dialog: { text: 'done!' } }
    }),
    entry('intro-bbj/oo-samples/Car.bbj', {
      kind: 'class',
      entry: 'intro-bbj/oo-samples/CarApplication.bbj',
      expect: {}
    }),
    entry('intro-bbj/oo-samples/CarApplication.bbj', { kind: 'print', expect: { print: [] } })
  ]
  entries.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  return { schema: 1, entries }
}

before(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'courses-manifest-test-'))
  examplesDir = path.join(root, 'examples')
  docsDir = path.join(root, 'docs')
  for (const e of validManifest().entries) {
    const withPanel = ['dwc/04_ExtendedAttributes/LabelAttributes.bbj', 'dwc/07_ControlValiation/Exercise-BuiltInValidation.bbj']
    put(examplesDir, e.id, withPanel.includes(e.id) ? PANEL : 'rem sample\n')
  }
  put(examplesDir, 'dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.css', 'body {}\n')
  put(docsDir, 'dwc/page.md', '# Page\n')
})

after(() => {
  fs.rmSync(root, { recursive: true, force: true })
})

function ctx() {
  return { files: listExampleFiles(examplesDir), examplesDir, docsDir }
}

function errorsFor(mutate) {
  const man = validManifest()
  mutate(man)
  return validateManifest(man, ctx())
}

function assertError(errors, id, pattern) {
  assert.ok(
    errors.some((e) => e.startsWith(`${id}: `) && pattern.test(e)),
    `expected an error for ${id} matching ${pattern}, got:\n${errors.join('\n')}`
  )
}

test('KINDS and ISSUES expose the documented values', () => {
  assert.deepEqual(KINDS, ['window', 'starter', 'print', 'dialog', 'class'])
  assert.deepEqual(Object.keys(ISSUES), ['3', '4', '5', '6', '7'])
  for (const [n, issue] of Object.entries(ISSUES)) {
    assert.equal(issue.url, `https://github.com/BasisHub/Courses/issues/${n}`)
    assert.ok(Array.isArray(issue.lines) && issue.lines.length > 0)
  }
})

test('listExampleFiles returns sorted POSIX ids of every .bbj', () => {
  const files = listExampleFiles(examplesDir)
  assert.ok(files.includes('dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj'))
  assert.ok(!files.some((f) => f.endsWith('.css')))
  assert.ok(!files.some((f) => f.includes('\\')))
  assert.deepEqual(files, [...files].sort())
})

test('coverageDiff reports both directions', () => {
  const diff = coverageDiff(['a/x.bbj', 'a/y.bbj'], { entries: [{ id: 'a/x.bbj' }, { id: 'a/z.bbj' }] })
  assert.deepEqual(diff, { missingEntries: ['a/y.bbj'], missingFiles: ['a/z.bbj'] })
})

test('coverageDiff of a matching pair is empty', () => {
  const diff = coverageDiff(['a/x.bbj'], { entries: [{ id: 'a/x.bbj' }] })
  assert.deepEqual(diff, { missingEntries: [], missingFiles: [] })
})

test('runnableEntries drops class entries and entryById finds one', () => {
  const man = validManifest()
  const runnable = runnableEntries(man)
  assert.equal(runnable.length, man.entries.length - 1)
  assert.ok(runnable.every((e) => e.kind !== 'class'))
  assert.equal(entryById(man, 'dwc/01_GUI2BUI2DWC/DWC2.bbj').issues[0], 4)
  assert.equal(entryById(man, 'dwc/none.bbj'), undefined)
})

test('loadManifest reads a manifest file', () => {
  const file = path.join(root, 'm.json')
  fs.writeFileSync(file, JSON.stringify(validManifest()))
  assert.equal(loadManifest(file).schema, 1)
})

test('a valid synthetic manifest has no errors', () => {
  assert.deepEqual(validateManifest(validManifest(), ctx()), [])
})

test('schema and entries shape are checked', () => {
  const errs = validateManifest({ schema: 2, entries: 'x' }, ctx())
  assert.ok(errs.some((e) => /schema/.test(e)))
  assert.ok(errs.some((e) => /entries/.test(e)))
})

test('unknown kind is rejected', () => {
  const id = 'dwc/01_GUI2BUI2DWC/DWC2.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).kind = 'gui'
  })
  assertError(errs, id, /kind/)
})

test('a class entry whose entry is itself is rejected', () => {
  const id = 'intro-bbj/oo-samples/Car.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).entry = id
  })
  assertError(errs, id, /class/)
})

test('a class entry that points at another class is rejected', () => {
  const id = 'intro-bbj/oo-samples/Car.bbj'
  const errs = errorsFor((m) => {
    entryById(m, 'intro-bbj/oo-samples/CarApplication.bbj').kind = 'class'
  })
  assertError(errs, id, /class/)
})

test('a non-class entry must be its own entry program', () => {
  const id = 'dwc/01_GUI2BUI2DWC/DWC2.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).entry = 'intro-bbj/oo-samples/CarApplication.bbj'
  })
  assertError(errs, id, /entry/)
})

test('a missing dependency file is rejected', () => {
  const id = 'dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).deps = ['dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Nope.css']
  })
  assertError(errs, id, /dependency.*Nope\.css/)
})

test('a missing page is rejected', () => {
  const id = 'dwc/01_GUI2BUI2DWC/DWC2.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).pages = ['dwc/missing-page.md']
  })
  assertError(errs, id, /page.*missing-page\.md/)
})

test('an empty page list is rejected', () => {
  const id = 'dwc/01_GUI2BUI2DWC/DWC2.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).pages = []
  })
  assertError(errs, id, /pages/)
})

test('a malformed external resource is rejected', () => {
  const id = 'dwc/01_GUI2BUI2DWC/DWC2.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).external = ['http://insecure.example', 'cdn.example.com']
  })
  assertError(errs, id, /external/)
})

test('a window entry without expect.title is rejected', () => {
  const id = 'dwc/01_GUI2BUI2DWC/DWC2.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).expect = {}
  })
  assertError(errs, id, /title/)
})

test('a window entry with a null title is accepted', () => {
  const id = 'dwc/01_GUI2BUI2DWC/DWC2.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).expect = { title: null }
  })
  assert.deepEqual(errs, [])
})

test('a print entry without expect.print is rejected', () => {
  const id = 'dwc/03C_Grid2GridEx/DataRow_and_ResultSet/1_DataRowFromCode.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).expect = {}
  })
  assertError(errs, id, /print/)
})

test('a dialog entry without expect.dialog is rejected', () => {
  const id = 'dwc/08_BrowserConstraints/SysPrint.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).expect = {}
  })
  assertError(errs, id, /dialog/)
})

test('a malformed startDialog is rejected', () => {
  const id = 'dwc/04_ExtendedAttributes/LabelAttributes.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).expect.startDialog = { button: 3 }
  })
  assertError(errs, id, /startDialog/)
})

test('an issue number outside 3 to 7 is rejected', () => {
  const id = 'dwc/01_GUI2BUI2DWC/DWC2.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).issues = [4, 9]
  })
  assertError(errs, id, /issue/)
})

test('unsorted ids are rejected', () => {
  const errs = errorsFor((m) => {
    m.entries.reverse()
  })
  assert.ok(errs.some((e) => /ascending|sorted/.test(e)), errs.join('\n'))
})

test('duplicate ids are rejected', () => {
  const id = 'dwc/01_GUI2BUI2DWC/DWC2.bbj'
  const errs = errorsFor((m) => {
    const i = m.entries.findIndex((e) => e.id === id)
    m.entries.splice(i, 0, structuredClone(m.entries[i]))
  })
  assertError(errs, id, /duplicate/)
})

test('ids that leave docs/examples or have the wrong shape are rejected', () => {
  const errs = errorsFor((m) => {
    m.entries.push(entry('dwc/../../escape.bbj'))
    m.entries.push(entry('other/File.bbj'))
  })
  assertError(errs, 'dwc/../../escape.bbj', /id/)
  assertError(errs, 'other/File.bbj', /id/)
})

test('a missing issue 6 anchor on an icon pool file is rejected', () => {
  const id = 'dwc/06_IconPools/Exercise-IconPoolsComplete.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).issues = []
  })
  assertError(errs, id, /#6/)
})

test('a missing anchor on the file an issue names is rejected', () => {
  const id = 'dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).issues = []
  })
  assertError(errs, id, /#3/)
})

test('a file that calls setPanelStyle("@element", ...) needs issue 7', () => {
  const id = 'dwc/04_ExtendedAttributes/LabelAttributes.bbj'
  const errs = errorsFor((m) => {
    entryById(m, id).issues = [5]
  })
  assertError(errs, id, /#7/)
})

test('a file without an entry and an entry without a file are named', () => {
  put(examplesDir, 'dwc/99_Extra/Extra.bbj', 'rem extra\n')
  try {
    const errs = validateManifest(validManifest(), ctx())
    assert.ok(errs.includes('dwc/99_Extra/Extra.bbj: file has no manifest entry'), errs.join('\n'))
  } finally {
    fs.rmSync(path.join(examplesDir, 'dwc', '99_Extra'), { recursive: true, force: true })
  }
  const man = validManifest()
  man.entries.push(entry('dwc/zz/Ghost.bbj'))
  const errs = validateManifest(man, ctx())
  assert.ok(errs.includes('dwc/zz/Ghost.bbj: entry has no file'), errs.join('\n'))
})

test('two entries that map to one app name are rejected', () => {
  const errs = errorsFor((m) => {
    m.entries.push(entry('dwc/01_GUI2BUI2DWC/DWC2.bbj'.replace('DWC2', 'dwc2')))
  })
  assert.ok(errs.some((e) => /app name/.test(e)), errs.join('\n'))
})
