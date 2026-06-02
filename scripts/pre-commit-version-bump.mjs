#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

if (process.env.SKIP_VERSION_BUMP_HOOK === '1') {
  process.exit(0)
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    ...options,
  })

  if (result.error) {
    throw result.error
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status)
  }
}

run(process.execPath, [join(ROOT, 'scripts', 'guard-production-commit.mjs')])

run(process.execPath, [
  join(ROOT, 'scripts', 'bump-version.mjs'),
  'patch',
  '--root-only',
])
run('git', ['add', 'package.json', 'apps/client-web/package.json'])
