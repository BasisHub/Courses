import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { listExampleFiles, loadManifest, coverageDiff, validateManifest } from '../lib/manifest.js'

// SAMP-01: every .bbj under docs/examples has a manifest entry, every entry has a file.
const repoRoot = path.resolve(import.meta.dirname, '..', '..', '..')
const examplesDir = path.join(repoRoot, 'docs', 'examples')
const docsDir = path.join(repoRoot, 'docs', 'docs')

const files = listExampleFiles(examplesDir)
const manifest = loadManifest()

test('every .bbj under docs/examples has a manifest entry, and every entry has a file', () => {
  const diff = coverageDiff(files, manifest)
  assert.equal(
    diff.missingEntries.length,
    0,
    `files without a manifest entry (${diff.missingEntries.length}):\n${diff.missingEntries.join('\n')}`
  )
  assert.equal(
    diff.missingFiles.length,
    0,
    `manifest entries without a file (${diff.missingFiles.length}):\n${diff.missingFiles.join('\n')}`
  )
})

test('the manifest is valid', () => {
  const errors = validateManifest(manifest, { files, examplesDir, docsDir })
  assert.equal(errors.length, 0, `manifest errors (${errors.length}):\n${errors.join('\n')}`)
})
