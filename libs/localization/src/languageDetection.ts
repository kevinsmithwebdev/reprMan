import {
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
  languageFromLocaleTag,
  type SupportedLanguage,
} from './languageDetectionCore'

export {
  LANGUAGE_STORAGE_KEY,
  LANGUAGE_DISPLAY_ORDER,
  SUPPORTED_LANGUAGES,
  languageFromLocaleTag,
  type SupportedLanguage,
} from './languageDetectionCore'

export const readStoredLanguage = (): SupportedLanguage | null => {
  if (typeof globalThis.localStorage === 'undefined') {
    return null
  }
  const stored = globalThis.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return isSupportedLanguage(stored) ? stored : null
}

/** Prefer the first supported language from the browser locale list. */
export const resolveBrowserLanguage = (): SupportedLanguage => {
  const navigatorRef = globalThis.navigator
  if (!navigatorRef) {
    return 'en'
  }

  const candidates = [
    ...(navigatorRef.languages ?? []),
    navigatorRef.language,
  ].filter((value): value is string => Boolean(value))

  const resolved = candidates
    .map(languageFromLocaleTag)
    .find((lang): lang is SupportedLanguage => lang !== null)

  return resolved ?? 'en'
}

/**
 * Stored user choice wins; otherwise detect from the browser; otherwise English.
 */
export const resolveInitialLanguage = (): SupportedLanguage =>
  readStoredLanguage() ?? resolveBrowserLanguage()
