#!/usr/bin/env node
/**
 * Rewrite LCOV SF: paths to repo-root-relative POSIX paths so SonarQube can
 * match coverage to sources under apps/ and libs/.
 *
 * Vitest runs from apps/client-web, so SF entries are relative to that cwd
 * (e.g. src/App.tsx, ../../libs/state/src/store.ts).
 * Jest runs from each package root (e.g. apps/server), so SF entries are
 * relative to that package (e.g. src/handlers/router.ts).
 *
 * Idempotent: safe to run after tests and again before Sonar (CI does both).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const vitestRoot = resolve(root, 'apps/client-web')
const defaultLcov = resolve(vitestRoot, 'coverage/lcov.info')
const lcovPaths = process.argv.slice(2).map((p) => resolve(root, p))
const targets = lcovPaths.length > 0 ? lcovPaths : [defaultLcov]

const toPosix = (p) => p.replaceAll('\\', '/')

/** Project root for an lcov file at `<project>/coverage/lcov.info`. */
const projectRootForLcov = (lcovPath) => resolve(lcovPath, '../..')

const toRepoRelativePath = (rawPath, projectRoot) => {
  const posix = toPosix(rawPath.replace(/^\.\/+/, ''))
  if (posix.startsWith('libs/') || posix.startsWith('apps/')) {
    return posix
  }
  return toPosix(relative(root, resolve(projectRoot, rawPath)))
}

for (const lcovPath of targets) {
  const projectRoot = projectRootForLcov(lcovPath)
  const lcov = readFileSync(lcovPath, 'utf8')
  const normalized = lcov.replace(/^SF:(.+)$/gm, (_, rawPath) => {
    return `SF:${toRepoRelativePath(rawPath, projectRoot)}`
  })

  writeFileSync(lcovPath, normalized)
  console.log(
    `[normalize-lcov-paths] Normalized SF paths in ${lcovPath} (project root: ${toPosix(
      relative(root, projectRoot)
    )})`
  )
}
