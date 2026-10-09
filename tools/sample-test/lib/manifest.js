import fs from 'node:fs'
import path from 'node:path'
import { APP_NAME_RE, appName } from './names.js'

// manifest.json describes every .bbj under docs/examples: what it is, what it needs, which course
// pages describe it and which of Stephan's GitHub issues it carries. The course page is the spec.

const DEFAULT_MANIFEST = path.resolve(import.meta.dirname, '..', 'manifest.json')

export const KINDS = ['window', 'starter', 'print', 'dialog', 'class']

// Stephan's issues. `file` is the sample the issue names, `lines` the lines it points at today,
// `linked` where the issue links to (a commit and line that may have moved since).
export const ISSUES = {
  3: { url: 'https://github.com/BasisHub/Courses/issues/3', title: "Setting the css with @app-style on the window doesn't appear to have an impact in current BBj", file: 'dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj', lines: [18], linked: 'line 17 at 9342f97' },
  4: { url: 'https://github.com/BasisHub/Courses/issues/4', title: 'Is there a better way in modern DWC / BBj to do this?', file: 'dwc/01_GUI2BUI2DWC/DWC2.bbj', lines: [35], linked: 'line 35 at 6900fce (button title with an embedded dwc-icon)' },
  5: { url: 'https://github.com/BasisHub/Courses/issues/5', title: 'is --dwc-space overcome?', file: 'dwc/04_ExtendedAttributes/LabelAttributes.bbj', lines: [34], linked: 'line 34 at 6900fce (then var(--bbj-space); 777682c changed it to var(--dwc-space))' },
  6: { url: 'https://github.com/BasisHub/Courses/issues/6', title: 'Icon Buttons in this sample appear to not work at all', file: 'dwc/06_IconPools/DownloadButton.bbj', lines: [30, 31, 32, 35, 36, 37], linked: 'lines 27-28 at 777682c' },
  7: { url: 'https://github.com/BasisHub/Courses/issues/7', title: "it appears to be a pattern throughout that this way of setting styles to a panel doesn't work with BBj 26", file: 'dwc/07_ControlValiation/Exercise-BuiltInValidation.bbj', lines: [38], linked: 'line 38 at 777682c' }
}

const ID_RE = /^(dwc|intro-bbj)\/.+\.bbj$/
const EXTERNAL_RE = /^(https:\/\/\S+|prefix:\S+|db:\S+)$/
const ICON_POOLS_PREFIX = 'dwc/06_IconPools/'
// Every sample that styles an element through the panel style call carries issue 7.
const PANEL_STYLE_ELEMENT = 'setPanelStyle("@element"'

// A POSIX path that stays below its base: no empty, '.' or '..' segment, no backslash, not absolute.
function isSafeRelative(p) {
  if (typeof p !== 'string' || p === '' || p.includes('\\') || p.startsWith('/') || /^[A-Za-z]:/.test(p)) {
    return false
  }
  return p.split('/').every((segment) => segment !== '' && segment !== '.' && segment !== '..')
}

function fileBelow(base, rel) {
  return path.join(base, ...rel.split('/'))
}

function isFileBelow(base, rel) {
  if (!isSafeRelative(rel)) return false
  try {
    return fs.statSync(fileBelow(base, rel)).isFile()
  } catch {
    return false
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// Sorted POSIX ids of every .bbj below examplesDir.
export function listExampleFiles(examplesDir) {
  return fs
    .readdirSync(examplesDir, { recursive: true })
    .map((p) => String(p).split(path.sep).join('/'))
    .filter((p) => /\.bbj$/i.test(p))
    .filter((p) => fs.statSync(fileBelow(examplesDir, p)).isFile())
    .sort()
}

export function loadManifest(file = DEFAULT_MANIFEST) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

// ids: the files found on disk. Returns the ids that lack an entry and the entries that lack a file.
export function coverageDiff(ids, manifest) {
  const entries = Array.isArray(manifest?.entries) ? manifest.entries : []
  const entryIds = new Set(entries.map((e) => e.id))
  const fileIds = new Set(ids)
  return {
    missingEntries: ids.filter((id) => !entryIds.has(id)),
    missingFiles: [...entryIds].filter((id) => !fileIds.has(id)).sort()
  }
}

export function runnableEntries(manifest) {
  return manifest.entries.filter((e) => e.kind !== 'class')
}

export function entryById(manifest, id) {
  return manifest.entries.find((e) => e.id === id)
}

// Returns one `<id>: <problem>` string per violation. An empty array means the manifest is valid.
export function validateManifest(manifest, { files, examplesDir, docsDir }) {
  const errors = []
  const fail = (id, problem) => errors.push(`${id}: ${problem}`)

  if (!isObject(manifest)) return ['manifest: must be an object']
  if (manifest.schema !== 1) errors.push('manifest: schema must be 1')
  if (!Array.isArray(manifest.entries)) {
    errors.push('manifest: entries must be an array')
    return errors
  }

  const entries = manifest.entries
  const idOf = (e, i) => (isObject(e) && typeof e.id === 'string' ? e.id : `entries[${i}]`)
  const byId = new Map()
  for (const [i, e] of entries.entries()) {
    const id = idOf(e, i)
    if (isObject(e) && !byId.has(id)) byId.set(id, e)
  }

  // 1. ids: unique, ascending, shaped like a program below docs/examples
  const seen = new Set()
  let previous = null
  const idErrors = new Set()
  for (const [i, e] of entries.entries()) {
    const id = idOf(e, i)
    if (!isObject(e)) fail(id, 'entry must be an object')
    if (!ID_RE.test(id) || !isSafeRelative(id)) {
      fail(id, 'id must be a POSIX path below docs/examples that matches (dwc|intro-bbj)/<path>.bbj')
      idErrors.add(id)
    }
    if (seen.has(id)) fail(id, 'duplicate id')
    seen.add(id)
    if (previous !== null && id < previous) fail(id, `id is not in ascending order (it follows ${previous})`)
    previous = id
  }

  // 2. coverage both ways
  const diff = coverageDiff(files, manifest)
  for (const id of diff.missingEntries) fail(id, 'file has no manifest entry')
  for (const id of diff.missingFiles) fail(id, 'entry has no file')

  // Anchors collected on the way: id -> issue numbers the entry has to carry.
  const required = new Map()
  const needAnchor = (id, n) => {
    if (!required.has(id)) required.set(id, new Set())
    required.get(id).add(n)
  }

  const issueNumbers = Object.keys(ISSUES).map(Number)

  for (const [i, e] of entries.entries()) {
    if (!isObject(e)) continue
    const id = idOf(e, i)

    // 3. kind and entry program
    if (!KINDS.includes(e.kind)) {
      fail(id, `unknown kind ${JSON.stringify(e.kind)} (use ${KINDS.join(', ')})`)
    } else if (e.kind === 'class') {
      if (e.entry === id) {
        fail(id, 'class entry names itself as entry program; it needs the runnable program that uses it')
      } else if (!byId.has(e.entry)) {
        fail(id, `class entry program ${JSON.stringify(e.entry)} is not a manifest entry`)
      } else if (byId.get(e.entry).kind === 'class') {
        fail(id, `class entry program ${e.entry} is itself a class, not a runnable program`)
      }
    } else if (e.entry !== id) {
      fail(id, `entry must equal id for kind ${e.kind}`)
    }

    // 4. deps, external, pages, issues, notes
    if (!Array.isArray(e.deps)) {
      fail(id, 'deps must be an array')
    } else {
      for (const dep of e.deps) {
        if (!isFileBelow(examplesDir, dep)) fail(id, `dependency ${JSON.stringify(dep)} does not exist below docs/examples`)
      }
    }
    if (!Array.isArray(e.external)) {
      fail(id, 'external must be an array')
    } else {
      for (const ext of e.external) {
        if (typeof ext !== 'string' || !EXTERNAL_RE.test(ext)) {
          fail(id, `external ${JSON.stringify(ext)} must be an https URL, prefix:<file> or db:<name>`)
        }
      }
    }
    if (!Array.isArray(e.pages) || e.pages.length === 0) {
      fail(id, 'pages must be a non-empty array')
    } else {
      for (const page of e.pages) {
        if (!isFileBelow(docsDir, page)) fail(id, `page ${JSON.stringify(page)} does not exist below docs/docs`)
      }
    }
    if (!Array.isArray(e.issues)) {
      fail(id, 'issues must be an array')
    } else {
      for (const n of e.issues) {
        if (!Number.isInteger(n) || !issueNumbers.includes(n)) {
          fail(id, `issue ${JSON.stringify(n)} must be one of ${issueNumbers.join(', ')}`)
        }
      }
    }
    if (typeof e.notes !== 'string') fail(id, 'notes must be a string')

    // 5. expectations by kind
    if (!isObject(e.expect)) {
      fail(id, 'expect must be an object')
    } else {
      const expect = e.expect
      if (e.kind === 'window' || e.kind === 'starter') {
        if (!Object.hasOwn(expect, 'title') || !(typeof expect.title === 'string' || expect.title === null)) {
          fail(id, `expect.title is required for kind ${e.kind} (a string, or null with the reason in notes)`)
        }
      }
      if (e.kind === 'print') {
        if (!Array.isArray(expect.print) || !expect.print.every((line) => typeof line === 'string')) {
          fail(id, 'expect.print must be an array of strings (empty when nothing predictable is printed)')
        }
      }
      if (e.kind === 'dialog') {
        const dialog = expect.dialog
        if (!isObject(dialog) || !(typeof dialog.title === 'string' || typeof dialog.text === 'string')) {
          fail(id, 'expect.dialog must be an object with a string title or a string text')
        }
      }
      if (Object.hasOwn(expect, 'startDialog')) {
        if (!isObject(expect.startDialog) || typeof expect.startDialog.button !== 'string') {
          fail(id, 'expect.startDialog must be { "button": <string> }')
        }
      }
    }

    // 6. anchors that depend on the entry itself
    if (id.startsWith(ICON_POOLS_PREFIX)) needAnchor(id, 6)
    if (!idErrors.has(id) && isFileBelow(examplesDir, id)) {
      if (fs.readFileSync(fileBelow(examplesDir, id), 'utf8').includes(PANEL_STYLE_ELEMENT)) needAnchor(id, 7)
    }
  }

  // 6. anchors that name a file
  for (const [n, issue] of Object.entries(ISSUES)) {
    if (byId.has(issue.file)) {
      needAnchor(issue.file, Number(n))
    } else if (!files.includes(issue.file)) {
      fail(issue.file, `issue #${n} names a sample that is not below docs/examples`)
    }
  }
  for (const [id, numbers] of required) {
    const entry = byId.get(id)
    if (!entry || !Array.isArray(entry.issues)) continue
    for (const n of [...numbers].sort((a, b) => a - b)) {
      if (!entry.issues.includes(n)) fail(id, `missing issue #${n} anchor (${ISSUES[n].url})`)
    }
  }

  // 7. app names
  const names = new Map()
  for (const [i, e] of entries.entries()) {
    const id = idOf(e, i)
    if (idErrors.has(id)) continue
    const name = appName(id)
    if (!APP_NAME_RE.test(name)) fail(id, `app name ${JSON.stringify(name)} does not match ${APP_NAME_RE}`)
    if (names.has(name)) {
      fail(id, `app name ${JSON.stringify(name)} is also used by ${names.get(name)}`)
    } else {
      names.set(name, id)
    }
  }

  return errors
}
