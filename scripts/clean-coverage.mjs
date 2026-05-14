#!/usr/bin/env node
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

/** @param {string} dir */
function removeCoverageDirs(dir) {
  if (!existsSync(dir)) {
    return
  }

  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    const p = join(dir, entry.name)
    if (!entry.isDirectory()) {
      continue
    }
    if (entry.name === 'node_modules') {
      continue
    }
    if (entry.name === 'coverage') {
      rmSync(p, { recursive: true, force: true })
      console.log('Removed', p)
      continue
    }
    removeCoverageDirs(p)
  }
}

for (const top of ['apps', 'libs']) {
  removeCoverageDirs(join(ROOT, top))
}
