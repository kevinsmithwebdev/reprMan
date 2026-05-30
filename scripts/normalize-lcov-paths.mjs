#!/usr/bin/env node
/**
 * Rewrite LCOV SF: paths to repo-root-relative POSIX paths so SonarQube can
 * match coverage to sources under apps/ and libs/.
 *
 * Vitest runs from apps/client-web, so SF entries are relative to that cwd
 * (e.g. src/App.tsx, ../../libs/state/src/store.ts).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const vitestRoot = resolve(root, 'apps/client-web')
const lcovPath = resolve(vitestRoot, 'coverage/lcov.info')

const lcov = readFileSync(lcovPath, 'utf8')
const normalized = lcov.replace(/^SF:(.+)$/gm, (_, rawPath) => {
  const repoRelative = relative(root, resolve(vitestRoot, rawPath)).replaceAll(
    '\\',
    '/'
  )
  return `SF:${repoRelative}`
})

writeFileSync(lcovPath, normalized)
console.log(`[normalize-lcov-paths] Normalized SF paths in ${lcovPath}`)
