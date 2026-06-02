#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const kind = process.argv[2]

if (kind !== 'minor' && kind !== 'major') {
  console.error('Usage: node scripts/commit-with-bump.mjs <minor|major>')
  process.exit(1)
}

const commitMessage =
  kind === 'major' ? 'major version bump' : 'minor version bump'

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

run(process.execPath, [join(ROOT, 'scripts', 'bump-version.mjs'), kind])
run('git', ['add', 'package.json', 'apps/client-web/package.json'])
run('git', ['commit', '-m', commitMessage], {
  env: {
    ...process.env,
    SKIP_VERSION_BUMP_HOOK: '1',
  },
})
run('git', ['push'])
