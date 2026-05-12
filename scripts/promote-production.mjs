#!/usr/bin/env node
/**
 * Promote **main** (integration / Dev deploy branch) to **production** by merging and pushing.
 * GitHub Actions then validates, builds, and deploys prod (see `.github/workflows/deploy-prod.yml`).
 *
 * This script does not run AWS/CDK locally — it only moves git state so CI can deploy.
 *
 * Env (optional):
 *   REPRMAN_MAIN_BRANCH       default: main
 *   REPRMAN_PRODUCTION_BRANCH default: production
 *
 * Usage: yarn deploy:prod
 *
 * Branch protection: if `production` blocks direct pushes, either allow your account to push,
 * or promote via a GitHub PR from `main` into `production` instead of this script (README).
 */

import { spawnSync } from 'child_process'
import { dirname, join, resolve } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

function scriptDir() {
  const metaUrl = import.meta?.url
  if (typeof metaUrl === 'string' && metaUrl.length > 0) {
    return dirname(fileURLToPath(metaUrl))
  }
  const entry = process.argv[1]
  if (!entry) {
    console.error('Cannot resolve script directory (process.argv[1] is empty).')
    process.exit(1)
  }
  return dirname(fileURLToPath(pathToFileURL(resolve(entry)).href))
}

const ROOT = join(scriptDir(), '..')

const MAIN = process.env.REPRMAN_MAIN_BRANCH || 'main'
const PRODUCTION = process.env.REPRMAN_PRODUCTION_BRANCH || 'production'

function git(args, label) {
  console.error(`\n→ ${label}`)
  const r = spawnSync('git', args, { cwd: ROOT, stdio: 'inherit' })
  if (r.status !== 0) {
    process.exit(r.status ?? 1)
  }
}

function gitOut(args) {
  const r = spawnSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
  })
  return {
    status: r.status ?? 1,
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
  }
}

function requireCleanWorkingTree() {
  const { stdout } = gitOut(['status', '--porcelain'])
  if (stdout.trim()) {
    console.error(
      'Working tree is not clean. Commit or stash changes before promoting to production.'
    )
    process.exit(1)
  }
}

requireCleanWorkingTree()

git(['fetch', 'origin'], 'git fetch origin')

git(['checkout', MAIN], `git checkout ${MAIN}`)
git(['pull', '--ff-only', 'origin', MAIN], `git pull --ff-only origin ${MAIN}`)

const remoteProd = gitOut(['ls-remote', '--heads', 'origin', PRODUCTION])
const productionExists = remoteProd.stdout.trim().length > 0

if (!productionExists) {
  console.error(
    `\nNo remote branch origin/${PRODUCTION} yet — creating it from ${MAIN} (first promotion).`
  )
  spawnSync('git', ['branch', '-D', PRODUCTION], {
    cwd: ROOT,
    stdio: 'ignore',
  })
  git(['checkout', '-b', PRODUCTION], `git checkout -b ${PRODUCTION}`)
  git(['push', '-u', 'origin', PRODUCTION], `git push -u origin ${PRODUCTION}`)
  console.error(
    `\nDone. Branch "${PRODUCTION}" was created and pushed. GitHub Actions should deploy production.`
  )
  process.exit(0)
}

git(['checkout', PRODUCTION], `git checkout ${PRODUCTION}`)
git(
  ['pull', '--ff-only', 'origin', PRODUCTION],
  `git pull --ff-only origin ${PRODUCTION}`
)

const mergeMsg = `chore: promote ${MAIN} to ${PRODUCTION}`
const merge = spawnSync(
  'git',
  ['merge', `origin/${MAIN}`, '-m', mergeMsg, '--no-ff'],
  { cwd: ROOT, stdio: 'inherit' }
)
if (merge.status !== 0) {
  console.error(
    `\nMerge failed (conflicts or not mergeable). Resolve manually, then push ${PRODUCTION}, or abort with: git merge --abort`
  )
  process.exit(merge.status ?? 1)
}

git(['push', 'origin', PRODUCTION], `git push origin ${PRODUCTION}`)

console.error(
  `\nDone. "${PRODUCTION}" is updated from "${MAIN}". GitHub Actions should validate, build, and deploy production.`
)
