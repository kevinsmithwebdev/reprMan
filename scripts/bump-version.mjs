#!/usr/bin/env node
/**
 * Bump semver in package.json and apps/client-web/package.json (kept in sync).
 * Usage: node scripts/bump-version.mjs <patch|minor|major> [--root-only]
 *
 * --root-only  Bump only the repo root package.json (pre-commit hook).
 *              Avoids calling `npm version` via yarn, which triggers npm 10+
 *              warnings about Yarn's version-* config env vars.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ALL_PACKAGE_PATHS = [
  join(ROOT, 'package.json'),
  join(ROOT, 'apps', 'client-web', 'package.json'),
]

const args = process.argv.slice(2)
const rootOnly = args.includes('--root-only')
const kind = args.find((a) => a === 'patch' || a === 'minor' || a === 'major')

if (!kind) {
  console.error(
    'Usage: node scripts/bump-version.mjs <patch|minor|major> [--root-only]'
  )
  process.exit(1)
}

const PACKAGE_PATHS = rootOnly
  ? [join(ROOT, 'package.json')]
  : ALL_PACKAGE_PATHS

function parseVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v).trim())
  if (!m) throw new Error(`Invalid semver: ${v}`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

function bump([maj, min, pat], bumpKind) {
  if (bumpKind === 'major') return `${maj + 1}.0.0`
  if (bumpKind === 'minor') return `${maj}.${min + 1}.0`
  return `${maj}.${min}.${pat + 1}`
}

function compareVersions(a, b) {
  const [aMaj, aMin, aPat] = parseVersion(a)
  const [bMaj, bMin, bPat] = parseVersion(b)

  if (aMaj !== bMaj) return aMaj - bMaj
  if (aMin !== bMin) return aMin - bMin
  return aPat - bPat
}

const versions = PACKAGE_PATHS.map(
  (p) => JSON.parse(readFileSync(p, 'utf8')).version
)
let current = versions[0]
if (versions.some((v) => v !== current)) {
  if (rootOnly) {
    console.error(
      'Version mismatch between package.json files:',
      versions.join(', ')
    )
    process.exit(1)
  }

  current = versions.reduce(
    (acc, v) => (compareVersions(v, acc) > 0 ? v : acc),
    versions[0]
  )
  console.warn(
    `Version mismatch detected (${versions.join(
      ', '
    )}); syncing from highest version ${current}.`
  )
}

const next = bump(parseVersion(current), kind)
console.log(`${current} → ${next}`)

for (const p of PACKAGE_PATHS) {
  const pkg = JSON.parse(readFileSync(p, 'utf8'))
  pkg.version = next
  writeFileSync(p, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
}
