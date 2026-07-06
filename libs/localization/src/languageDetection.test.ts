import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  LANGUAGE_STORAGE_KEY,
  readStoredLanguage,
  resolveBrowserLanguage,
  resolveInitialLanguage,
} from './languageDetection'

describe('languageDetection', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('reads a supported language from localStorage', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'es')
    expect(readStoredLanguage()).toBe('es')
  })

  it('returns null for unsupported stored values', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'xx')
    expect(readStoredLanguage()).toBeNull()
  })

  it('returns null when localStorage is unavailable', () => {
    const original = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: undefined,
    })

    try {
      expect(readStoredLanguage()).toBeNull()
    } finally {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: original,
      })
    }
  })

  it('resolves browser language from navigator', () => {
    const originalNavigator = globalThis.navigator
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        language: 'fr-FR',
        languages: ['fr-FR', 'en-US'],
      },
    })

    try {
      expect(resolveBrowserLanguage()).toBe('fr')
    } finally {
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: originalNavigator,
      })
    }
  })

  it('falls back to English when navigator is unavailable', () => {
    const originalNavigator = globalThis.navigator
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: undefined,
    })

    try {
      expect(resolveBrowserLanguage()).toBe('en')
    } finally {
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: originalNavigator,
      })
    }
  })

  it('prefers stored language over browser detection', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'de')
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { language: 'es-ES', languages: ['es-ES'] },
    })

    expect(resolveInitialLanguage()).toBe('de')
  })
})
