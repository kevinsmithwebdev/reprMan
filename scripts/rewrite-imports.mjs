#!/usr/bin/env node
/**
 * Phase 2 / Phase 3 helper: rewrites in-app imports
 * (`components/Header`, `state/reprs`, etc.) into the new
 * `@reprman/<lib>` workspace aliases. Idempotent — safe to re-run.
 *
 * Run from repo root:
 *   node scripts/rewrite-imports.mjs
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs'
import { extname, join } from 'node:path'

const ROOTS = ['apps/client-web/src', 'libs']
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs'])

// Order matters: more specific patterns first.
const RULES = [
  // modules/* — split into individual lib aliases
  [/(['"])modules\/CognitoAuth(['"/])/g, '$1@reprman/cognito-auth$2'],
  [/(['"])modules\/Localization(['"/])/g, '$1@reprman/localization$2'],
  [/(['"])modules\/ReprsApi(['"/])/g, '$1@reprman/reprs-api$2'],

  // Top-level lib folders
  [/(['"])components(['"/])/g, '$1@reprman/components$2'],
  [/(['"])modals(['"/])/g, '$1@reprman/modals$2'],
  [/(['"])state(['"/])/g, '$1@reprman/state$2'],
  [/(['"])utilities(['"/])/g, '$1@reprman/utilities$2'],
  [/(['"])types(['"/])/g, '$1@reprman/types$2'],
  [/(['"])themes(['"/])/g, '$1@reprman/theme$2'],

  // constants is a special case: existing imports use `'constants/index'`
  // (or `'constants'`). Map both to `'@reprman/constants'`.
  [/(['"])constants\/index(['"])/g, '$1@reprman/constants$2'],
  [/(['"])constants(['"/])/g, '$1@reprman/constants$2'],

  // configureAmplify lives in the cognito-auth lib now.
  [
    /(['"])config\/configureAmplify(['"])/g,
    '$1@reprman/cognito-auth/configureAmplify$2',
  ],
]

let totalFiles = 0
let totalRewrites = 0

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    let s
    try {
      s = statSync(full)
    } catch {
      continue
    }
    if (s.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === 'build') {
        continue
      }
      walk(full)
    } else if (EXTENSIONS.has(extname(full))) {
      processFile(full)
    }
  }
}

const processFile = (file) => {
  const original = readFileSync(file, 'utf8')
  let next = original
  for (const [pattern, replacement] of RULES) {
    next = next.replace(pattern, replacement)
  }
  if (next !== original) {
    writeFileSync(file, next)
    const rewrites = (original.match(/from ['"]/g) ?? []).length
    totalRewrites += rewrites
    totalFiles += 1
    console.log(`  rewrote ${file}`)
  }
}

for (const root of ROOTS) {
  walk(root)
}

console.log(
  `\nDone. Touched ${totalFiles} files (${totalRewrites} import lines scanned).`
)
