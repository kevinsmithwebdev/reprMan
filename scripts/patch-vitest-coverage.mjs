#!/usr/bin/env node
/**
 * Vitest 2.x writes coverage chunks without ensuring coverage/.tmp exists.
 * If the directory is removed mid-run (parallel runs, cleanup, Windows I/O),
 * writeFile throws ENOENT on coverage-N.json.
 * @see https://github.com/vitest-dev/vitest/issues/10111
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const vitestRoot = dirname(require.resolve('vitest/package.json'))
const coveragePath = join(vitestRoot, 'dist/coverage.js')
const PATCH_MARKER = 'reprMan: mkdir before coverage writeFile'

const original =
  'const promise = promises.writeFile(filename, JSON.stringify(coverage), "utf-8");'
const patched = `const promise = promises
      .mkdir(this.coverageFilesDirectory, { recursive: true })
      .then(() => promises.writeFile(filename, JSON.stringify(coverage), "utf-8")); // ${PATCH_MARKER}`

const source = readFileSync(coveragePath, 'utf8')

if (source.includes(PATCH_MARKER)) {
  process.exit(0)
}

if (!source.includes(original)) {
  console.warn(
    `[patch-vitest-coverage] Unexpected vitest coverage.js; patch not applied (${coveragePath})`
  )
  process.exit(0)
}

writeFileSync(coveragePath, source.replace(original, patched))
console.log(
  '[patch-vitest-coverage] Applied ENOENT guard to vitest coverage writes'
)
