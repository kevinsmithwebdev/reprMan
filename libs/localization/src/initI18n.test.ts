import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LANGUAGE_STORAGE_KEY } from './languageDetectionCore'
import { initI18n, resetI18nForTests } from './initI18n'

describe('initI18n', () => {
  beforeEach(() => {
    resetI18nForTests()
    localStorage.clear()
    document.documentElement.lang = ''
    document.cookie = ''
  })

  afterEach(() => {
    resetI18nForTests()
    vi.useRealTimers()
  })

  it('initializes i18next once and applies document language', () => {
    const first = initI18n({ initialLanguage: 'es' })
    const second = initI18n({ initialLanguage: 'fr' })

    expect(first).toBe(second)
    expect(first.language).toBe('es')
    expect(document.documentElement.lang).toBe('es')
  })

  it('persists language changes via storage and cookie', async () => {
    const storage = {
      setItem: vi.fn(async () => undefined),
      getItem: vi.fn(async () => null),
    }

    const i18n = initI18n({
      initialLanguage: 'en',
      storage,
    })

    await i18n.changeLanguage('pt')

    expect(storage.setItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY, 'pt')
    expect(document.cookie).toContain(`${LANGUAGE_STORAGE_KEY}=pt`)
  })

  it('falls back to localStorage when storage is not provided', async () => {
    const i18n = initI18n({ initialLanguage: 'en' })
    await i18n.changeLanguage('nl')
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('nl')
  })
})
