#!/usr/bin/env node
/**
 * Merges adjacent imports from the same module that resulted from the
 * original `from 'modules'` + `from 'modules/ReprsApi'` split during
 * Phase 2 rewrites.
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs'
import { extname, join } from 'node:path'

const ROOTS = ['apps/client-web/src', 'libs']
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs'])

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
  const lines = original.split(/\r?\n/)
  const importRe = /^import\s*\{\s*([^}]+)\s*\}\s*from\s*(['"][^'"]+['"])\s*$/
  const seen = new Map()

  for (let i = 0; i < lines.length; i += 1) {
    const m = importRe.exec(lines[i])
    if (!m) continue
    const names = m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const source = m[2]
    if (seen.has(source)) {
      const prev = seen.get(source)
      const merged = Array.from(new Set([...prev.names, ...names]))
      lines[prev.line] = `import { ${merged.join(', ')} } from ${source}`
      lines[i] = '__DELETE_LINE__'
      seen.set(source, { line: prev.line, names: merged })
    } else {
      seen.set(source, { line: i, names })
    }
  }

  const next = lines.filter((l) => l !== '__DELETE_LINE__').join('\n')
  if (next !== original) {
    writeFileSync(file, next)
    console.log(`  merged duplicates in ${file}`)
  }
}

for (const root of ROOTS) walk(root)

console.log('\nDone.')
