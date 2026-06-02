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

import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

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
  if ((r.status ?? 1) !== 0) {
    const error = new Error(`Git command failed: git ${args.join(' ')}`)
    error.exitCode = r.status ?? 1
    throw error
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
    const error = new Error(
      'Working tree is not clean. Commit or stash changes before promoting to production.'
    )
    error.exitCode = 1
    throw error
  }
}

let shouldReturnToMain = false
let shouldDeleteLocalProduction = false
let mergeConflictNeedsManualResolution = false
let exitCode = 0
let exitMessage = ''

try {
  requireCleanWorkingTree()

  git(['fetch', 'origin'], 'git fetch origin')

  git(['checkout', MAIN], `git checkout ${MAIN}`)
  git(
    ['pull', '--ff-only', 'origin', MAIN],
    `git pull --ff-only origin ${MAIN}`
  )

  const remoteProd = gitOut(['ls-remote', '--heads', 'origin', PRODUCTION])
  const productionExists = remoteProd.stdout.trim().length > 0

  if (productionExists) {
    git(['checkout', PRODUCTION], `git checkout ${PRODUCTION}`)
    shouldReturnToMain = true
    git(
      ['pull', '--ff-only', 'origin', PRODUCTION],
      `git pull --ff-only origin ${PRODUCTION}`
    )

    const mergeMsg = `chore: promote ${MAIN} to ${PRODUCTION}`
    const merge = spawnSync(
      'git',
      ['merge', `origin/${MAIN}`, '-m', mergeMsg, '--no-ff'],
      {
        cwd: ROOT,
        stdio: 'inherit',
        env: { ...process.env, ALLOW_PRODUCTION_COMMIT: '1' },
      }
    )
    if ((merge.status ?? 1) !== 0) {
      mergeConflictNeedsManualResolution = true
      const error = new Error(
        `\nMerge failed (conflicts or not mergeable). Resolve manually, then push ${PRODUCTION}, or abort with: git merge --abort`
      )
      error.exitCode = merge.status ?? 1
      throw error
    }

    git(['push', 'origin', PRODUCTION], `git push origin ${PRODUCTION}`)
    shouldDeleteLocalProduction = true
    console.error(
      `\nDone. "${PRODUCTION}" is updated from "${MAIN}". GitHub Actions should validate, build, and deploy production.`
    )
  } else {
    console.error(
      `\nNo remote branch origin/${PRODUCTION} yet — creating it from ${MAIN} (first promotion).`
    )
    spawnSync('git', ['branch', '-D', PRODUCTION], {
      cwd: ROOT,
      stdio: 'ignore',
    })
    git(['checkout', '-b', PRODUCTION], `git checkout -b ${PRODUCTION}`)
    shouldReturnToMain = true
    git(
      ['push', '-u', 'origin', PRODUCTION],
      `git push -u origin ${PRODUCTION}`
    )
    shouldDeleteLocalProduction = true
    console.error(
      `\nDone. Branch "${PRODUCTION}" was created and pushed. GitHub Actions should deploy production.`
    )
  }
} catch (error) {
  exitCode = error.exitCode ?? 1
  exitMessage = error.message || ''
} finally {
  if (mergeConflictNeedsManualResolution) {
    if (exitMessage) {
      console.error(exitMessage)
    }
    process.exit(exitCode || 1)
  }
  if (shouldReturnToMain) {
    const checkoutMain = spawnSync('git', ['checkout', MAIN], {
      cwd: ROOT,
      stdio: 'inherit',
    })
    if ((checkoutMain.status ?? 1) !== 0) {
      process.exit(checkoutMain.status ?? 1)
    }
  }
  if (shouldDeleteLocalProduction) {
    const deleteLocalProd = spawnSync('git', ['branch', '-D', PRODUCTION], {
      cwd: ROOT,
      stdio: 'inherit',
    })
    if ((deleteLocalProd.status ?? 1) !== 0) {
      process.exit(deleteLocalProd.status ?? 1)
    }
    console.error(
      `\nReturned to "${MAIN}" and removed local "${PRODUCTION}" branch for safety.`
    )
  }
  if (exitCode !== 0) {
    if (exitMessage) {
      console.error(exitMessage)
    }
    process.exit(exitCode)
  }
}
