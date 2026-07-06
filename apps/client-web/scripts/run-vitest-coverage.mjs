#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(root, '../..')

spawnSync(
  process.execPath,
  [resolve(repoRoot, 'scripts/patch-vitest-coverage.mjs')],
  {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  }
)

const args = [
  '../../node_modules/vitest/vitest.mjs',
  'run',
  '--config',
  'vitest.config.ts',
  '--coverage',
  ...process.argv.slice(2),
]
const result = spawnSync(process.execPath, args, {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})

if (result.status === 0) {
  const normalize = spawnSync(
    process.execPath,
    [resolve(repoRoot, 'scripts/normalize-lcov-paths.mjs')],
    {
      cwd: root,
      stdio: 'inherit',
      env: process.env,
    }
  )
  process.exit(normalize.status ?? 1)
}

process.exit(result.status ?? 1)
