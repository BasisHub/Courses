// DWC app names: every program the harness registers gets `courses-<book>-<slug>`.
export const APP_NAME_RE = /^courses-[a-z0-9]+(-[a-z0-9]+)*$/

// Lower case, every run of characters outside [a-z0-9] becomes one '-', no leading or trailing '-'.
export function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// A numbered folder such as 01_GUI2BUI2DWC or 03C_Grid2GridEx contributes only its number prefix.
const NUMBERED_FOLDER_RE = /^(\d+[A-Za-z]?)_/

function stemOf(file) {
  return file.replace(/\.bbj$/i, '')
}

// id 'dwc/<folders>/<File>.bbj' -> 'courses-' + [book, ...folders, stem].join('-')
export function appName(id) {
  const parts = id.split('/')
  const book = slug(parts[0])
  const folders = parts.slice(1, -1).map((folder) => {
    const numbered = NUMBERED_FOLDER_RE.exec(folder)
    return numbered ? numbered[1].toLowerCase() : slug(folder)
  })
  const stem = slug(stemOf(parts[parts.length - 1]))
  return ['courses', book, ...folders, stem].join('-')
}

// 'known-good.bbj' -> 'courses-fixture-known-good'
export function fixtureAppName(file) {
  return `courses-fixture-${slug(stemOf(file))}`
}
