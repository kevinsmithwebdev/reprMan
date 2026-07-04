#!/usr/bin/env node
/**
 * Writes minimal placeholder PNGs for the Expo app (icon, splash, adaptive icon).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const assetsDir = join('apps', 'client-mobile', 'assets')
mkdirSync(assetsDir, { recursive: true })

// 1x1 blue PNG
const pngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
const png = Buffer.from(pngBase64, 'base64')

for (const name of ['icon.png', 'splash.png', 'adaptive-icon.png']) {
  const path = join(assetsDir, name)
  writeFileSync(path, png)
  console.log(`wrote ${path}`)
}
