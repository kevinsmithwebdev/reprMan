import { describe, expect, it } from 'vitest'

describe('setupTests', () => {
  it('bridges jest to vitest', async () => {
    await import('./setupTests')
    expect((globalThis as { jest?: unknown }).jest).toBeDefined()
  })

  it('provides a matchMedia mock', async () => {
    await import('./setupTests')
    const mq = globalThis.matchMedia('(max-width: 999px)')
    expect(mq.matches).toBe(false)
    expect(typeof mq.addEventListener).toBe('function')
  })
})
