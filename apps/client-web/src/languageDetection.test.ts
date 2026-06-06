import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  languageFromLocaleTag,
  readStoredLanguage,
  resolveBrowserLanguage,
  resolveInitialLanguage,
  LANGUAGE_STORAGE_KEY,
} from '@reprman/localization/languageDetection'

describe('languageFromLocaleTag', () => {
  it('maps regional tags to supported base languages', () => {
    expect(languageFromLocaleTag('es-ES')).toBe('es')
    expect(languageFromLocaleTag('pt-PT')).toBe('pt')
    expect(languageFromLocaleTag('pt-BR')).toBe('pt')
    expect(languageFromLocaleTag('en-US')).toBe('en')
    expect(languageFromLocaleTag('fr-FR')).toBe('fr')
    expect(languageFromLocaleTag('de-DE')).toBe('de')
    expect(languageFromLocaleTag('nl-NL')).toBe('nl')
    expect(languageFromLocaleTag('ja-JP')).toBe('ja')
    expect(languageFromLocaleTag('zh-CN')).toBe('zh')
    expect(languageFromLocaleTag('ko-KR')).toBe('ko')
  })

  it('returns null for unsupported languages', () => {
    expect(languageFromLocaleTag('it-IT')).toBeNull()
    expect(languageFromLocaleTag('ru-RU')).toBeNull()
    expect(languageFromLocaleTag('ar')).toBeNull()
  })
})

describe('resolveBrowserLanguage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses the first supported browser locale', () => {
    vi.stubGlobal('navigator', {
      language: 'en-US',
      languages: ['it-IT', 'es-ES', 'en-US'],
    })

    expect(resolveBrowserLanguage()).toBe('es')
  })

  it('falls back to English when no browser locale is supported', () => {
    vi.stubGlobal('navigator', {
      language: 'it-IT',
      languages: ['it-IT', 'ru-RU'],
    })

    expect(resolveBrowserLanguage()).toBe('en')
  })

  it('falls back to English when navigator is unavailable', () => {
    vi.stubGlobal('navigator', undefined)

    expect(resolveBrowserLanguage()).toBe('en')
  })
})

describe('resolveInitialLanguage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    globalThis.localStorage?.removeItem(LANGUAGE_STORAGE_KEY)
  })

  it('prefers a stored language over browser detection', () => {
    globalThis.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'pt')
    vi.stubGlobal('navigator', {
      language: 'es-ES',
      languages: ['es-ES'],
    })

    expect(resolveInitialLanguage()).toBe('pt')
  })

  it('detects browser locale when nothing is stored', () => {
    vi.stubGlobal('navigator', {
      language: 'pt-PT',
      languages: ['pt-PT'],
    })

    expect(resolveInitialLanguage()).toBe('pt')
  })

  it('uses English when storage is empty and browser locale is unsupported', () => {
    vi.stubGlobal('navigator', {
      language: 'it-IT',
      languages: ['it-IT'],
    })

    expect(resolveInitialLanguage()).toBe('en')
  })

  it('ignores invalid stored values', () => {
    globalThis.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'it')
    vi.stubGlobal('navigator', {
      language: 'es-ES',
      languages: ['es-ES'],
    })

    expect(resolveInitialLanguage()).toBe('es')
  })
})

describe('readStoredLanguage', () => {
  afterEach(() => {
    globalThis.localStorage?.removeItem(LANGUAGE_STORAGE_KEY)
  })

  it('returns null for unsupported stored values', () => {
    globalThis.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'it')
    expect(readStoredLanguage()).toBeNull()
  })
})
