import type { PlatformStorage } from './storage.types'

export const createPlatformStorage = (): PlatformStorage => ({
  getItem: async (key: string) => {
    if (typeof globalThis.localStorage === 'undefined') {
      return null
    }
    return globalThis.localStorage.getItem(key)
  },
  setItem: async (key: string, value: string) => {
    if (typeof globalThis.localStorage === 'undefined') {
      return
    }
    globalThis.localStorage.setItem(key, value)
  },
})
