import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(root, '../..')

mkdirSync(resolve(root, 'coverage', '.tmp'), { recursive: true })

spawnSync(process.execPath, [resolve(repoRoot, 'scripts/patch-vitest-coverage.mjs')], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})

export default function setup() {}
