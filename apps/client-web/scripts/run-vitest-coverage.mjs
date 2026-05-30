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
  '--coverage',
  ...process.argv.slice(2),
]
const result = spawnSync(process.execPath, args, {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})

process.exit(result.status ?? 1)
