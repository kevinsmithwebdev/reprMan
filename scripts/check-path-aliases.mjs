#!/usr/bin/env node
/**
 * Verifies tsconfig.base.json path aliases match scripts/path-aliases.cjs.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { alias } = require('./path-aliases.cjs')

const root = resolve(import.meta.dirname, '..')
const tsconfig = JSON.parse(
  readFileSync(resolve(root, 'tsconfig.base.json'), 'utf8')
)
const paths = tsconfig.compilerOptions.paths ?? {}

const normalize = (value) =>
  value
    .replace(/\\/g, '/')
    .replace(/\/src\/index\.ts$/, '/src')
    .replace(/\/src$/, '/src')

const failures = []

for (const [key, target] of Object.entries(alias)) {
  const tsTargets = paths[key]
  if (!tsTargets?.length) {
    failures.push(`Missing tsconfig path for ${key}`)
    continue
  }
  const expected = normalize(target)
  const actual = normalize(resolve(root, tsTargets[0]))
  if (expected !== actual) {
    failures.push(
      `Alias mismatch for ${key}: tsconfig=${actual} canonical=${expected}`
    )
  }
}

if (failures.length > 0) {
  console.error('[check-path-aliases] failures:\n' + failures.join('\n'))
  process.exit(1)
}

console.log('[check-path-aliases] tsconfig.base.json matches path-aliases.cjs')
