import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { APP_NAME_RE, slug, appName, fixtureAppName } from './names.js'

const repoRoot = path.resolve(import.meta.dirname, '..', '..', '..')
const examplesDir = path.join(repoRoot, 'docs', 'examples')

test('slug lower-cases and collapses every run outside [a-z0-9] into one dash', () => {
  assert.equal(slug('DWC_ExternalCSS'), 'dwc-externalcss')
  assert.equal(slug('DWCFlexbox.BBj24'), 'dwcflexbox-bbj24')
  assert.equal(slug('  Hello,   World!  '), 'hello-world')
  assert.equal(slug('1_DataRowFromCode'), '1-datarowfromcode')
})

test('appName builds the six documented names exactly', () => {
  const cases = [
    ['dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj', 'courses-dwc-01-dwc-externalcss-sample'],
    ['dwc/01_GUI2BUI2DWC/DWC2.bbj', 'courses-dwc-01-dwc2'],
    [
      'dwc/03C_Grid2GridEx/DataRow_and_ResultSet/1_DataRowFromCode.bbj',
      'courses-dwc-03c-datarow-and-resultset-1-datarowfromcode'
    ],
    ['dwc/05_CssLayouts/DWCFlexbox.BBj24.bbj', 'courses-dwc-05-dwcflexbox-bbj24'],
    ['intro-bbj/dwc-lesson-start/Sample.bbj', 'courses-intro-bbj-dwc-lesson-start-sample'],
    [
      'intro-bbj/exercises/oo-tic-tac-toe/PlayTicTacToe.bbj',
      'courses-intro-bbj-exercises-oo-tic-tac-toe-playtictactoe'
    ]
  ]
  for (const [id, expected] of cases) {
    assert.equal(appName(id), expected, id)
  }
})

test('appName keeps only the numeric prefix of a numbered folder', () => {
  assert.equal(appName('dwc/10_AdvancedResponsive/Exercise-MediaQueriesComplete.bbj'), 'courses-dwc-10-exercise-mediaqueriescomplete')
  assert.equal(appName('dwc/03B_ArcFiles/ArcSample.bbj'), 'courses-dwc-03b-arcsample')
})

test('fixtureAppName names harness fixtures', () => {
  assert.equal(fixtureAppName('known-good.bbj'), 'courses-fixture-known-good')
  assert.equal(fixtureAppName('known-missing-css.bbj'), 'courses-fixture-known-missing-css')
})

test('APP_NAME_RE accepts lower-case dashed names and rejects the rest', () => {
  assert.ok(APP_NAME_RE.test('courses-dwc-01-dwc2'))
  assert.ok(!APP_NAME_RE.test('Courses-dwc'))
  assert.ok(!APP_NAME_RE.test('courses-dwc_01'))
  assert.ok(!APP_NAME_RE.test('courses-dwc--01'))
  assert.ok(!APP_NAME_RE.test('courses-dwc-'))
  assert.ok(!APP_NAME_RE.test('other-dwc'))
})

test('every real example gets a valid and distinct app name', () => {
  const ids = fs
    .readdirSync(examplesDir, { recursive: true })
    .map((p) => p.split(path.sep).join('/'))
    .filter((p) => /\.bbj$/i.test(p))
    .sort()
  assert.ok(ids.length >= 63, `expected at least 63 examples, found ${ids.length}`)
  const seen = new Map()
  for (const id of ids) {
    const name = appName(id)
    assert.match(name, APP_NAME_RE, id)
    assert.ok(!seen.has(name), `${id} and ${seen.get(name)} share the app name ${name}`)
    seen.set(name, id)
  }
})
