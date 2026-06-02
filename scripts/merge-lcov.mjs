#!/usr/bin/env node
/**
 * Merge multiple lcov.info files into one report for Sonar.
 * When the same SF path appears in multiple inputs, later files win.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const outputPath = resolve(root, 'apps/client-web/coverage/lcov.info')

const inputPaths = process.argv.slice(2).map((p) => resolve(root, p))

const parseRecords = (content) => {
  const records = new Map()
  const blocks = content.split('end_of_record\n')
  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue
    const sfMatch = trimmed.match(/^SF:(.+)$/m)
    if (!sfMatch) continue
    records.set(sfMatch[1], `${trimmed}\nend_of_record\n`)
  }
  return records
}

const merged = new Map()
for (const inputPath of inputPaths) {
  const content = readFileSync(inputPath, 'utf8')
  for (const [sf, record] of parseRecords(content)) {
    merged.set(sf, record)
  }
}

writeFileSync(outputPath, [...merged.values()].join(''))
console.log(
  `[merge-lcov] Wrote ${merged.size} records to ${outputPath} from ${inputPaths.length} inputs`
)
