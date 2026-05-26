#!/usr/bin/env node
/**
 * Bump semver in package.json and apps/client-web/package.json (kept in sync).
 * Usage: node scripts/bump-version.mjs <minor|major>
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PACKAGE_PATHS = [
  join(ROOT, 'package.json'),
  join(ROOT, 'apps', 'client-web', 'package.json'),
]

const kind = process.argv[2]
if (kind !== 'minor' && kind !== 'major') {
  console.error('Usage: node scripts/bump-version.mjs <minor|major>')
  process.exit(1)
}

function parseVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v).trim())
  if (!m) throw new Error(`Invalid semver: ${v}`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

function bump([maj, min], bumpKind) {
  if (bumpKind === 'major') return `${maj + 1}.0.0`
  return `${maj}.${min + 1}.0`
}

const versions = PACKAGE_PATHS.map(
  (p) => JSON.parse(readFileSync(p, 'utf8')).version
)
const current = versions[0]
if (versions.some((v) => v !== current)) {
  console.error(
    'Version mismatch between package.json files:',
    versions.join(', ')
  )
  process.exit(1)
}

const next = bump(parseVersion(current), kind)
console.log(`${current} → ${next}`)

for (const p of PACKAGE_PATHS) {
  const pkg = JSON.parse(readFileSync(p, 'utf8'))
  pkg.version = next
  writeFileSync(p, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
}
