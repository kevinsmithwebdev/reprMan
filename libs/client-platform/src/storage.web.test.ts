import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createPlatformStorage } from './storage.web'

describe('createPlatformStorage', () => {
  const storage = createPlatformStorage()

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('reads and writes via localStorage', async () => {
    await storage.setItem('lang', 'en')
    await expect(storage.getItem('lang')).resolves.toBe('en')
    await expect(storage.getItem('missing')).resolves.toBeNull()
  })

  it('returns null when localStorage is unavailable', async () => {
    const original = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: undefined,
    })

    try {
      await expect(storage.getItem('lang')).resolves.toBeNull()
      await expect(storage.setItem('lang', 'en')).resolves.toBeUndefined()
    } finally {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: original,
      })
    }
  })
})
