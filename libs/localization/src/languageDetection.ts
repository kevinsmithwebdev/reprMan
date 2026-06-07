export const LANGUAGE_STORAGE_KEY = 'reprman-language'
export const SUPPORTED_LANGUAGES = [
  'en',
  'es',
  'pt',
  'fr',
  'de',
  'nl',
  'ja',
  'zh',
  'ko',
] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

/** Order shown in the language dropdown. */
export const LANGUAGE_DISPLAY_ORDER: SupportedLanguage[] = [
  'en',
  'es',
  'pt',
  'fr',
  'de',
  'nl',
  'ja',
  'zh',
  'ko',
]

export const isSupportedLanguage = (
  value: string | null | undefined
): value is SupportedLanguage =>
  SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)

export const readStoredLanguage = (): SupportedLanguage | null => {
  if (typeof globalThis.localStorage === 'undefined') {
    return null
  }
  const stored = globalThis.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return isSupportedLanguage(stored) ? stored : null
}

/** Map a BCP 47 tag (e.g. es-ES, pt-PT) to a supported app language, or null. */
export const languageFromLocaleTag = (
  tag: string
): SupportedLanguage | null => {
  const base = tag.split('-')[0]?.toLowerCase()
  return isSupportedLanguage(base) ? base : null
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
