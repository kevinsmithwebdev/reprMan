#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const PRODUCTION = process.env.REPRMAN_PRODUCTION_BRANCH || 'production'
const ALLOW_PRODUCTION_COMMIT = process.env.ALLOW_PRODUCTION_COMMIT === '1'

if (ALLOW_PRODUCTION_COMMIT) {
  process.exit(0)
}

const branchResult = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
  cwd: ROOT,
  encoding: 'utf8',
})

if (branchResult.error) {
  throw branchResult.error
}

if ((branchResult.status ?? 1) !== 0) {
  process.exit(branchResult.status ?? 1)
}

const currentBranch = (branchResult.stdout || '').trim()

if (currentBranch === PRODUCTION) {
  console.error(
    `Committing on "${PRODUCTION}" is blocked. Use "yarn deploy:prod" instead.`
  )
  console.error(
    'If this is an intentional automated release commit, set ALLOW_PRODUCTION_COMMIT=1.'
  )
  process.exit(1)
}
