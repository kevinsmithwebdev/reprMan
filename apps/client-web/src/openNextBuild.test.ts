import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const clientWebRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('OpenNext packaging', () => {
  it('defines a package build script so `yarn build` works in client-web', () => {
    const pkg = JSON.parse(
      readFileSync(join(clientWebRoot, 'package.json'), 'utf8')
    ) as { scripts?: { build?: string } }

    expect(pkg.scripts?.build).toContain('next build')
  })

  it('sets OpenNext buildCommand to a Next.js production build', () => {
    const config = readFileSync(
      join(clientWebRoot, 'open-next.config.ts'),
      'utf8'
    )

    expect(config).toContain('buildCommand')
    expect(config).toContain('next build')
  })
})
