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

/** Map a BCP 47 tag (e.g. es-ES, pt-PT) to a supported app language, or null. */
export const languageFromLocaleTag = (
  tag: string
): SupportedLanguage | null => {
  const base = tag.split('-')[0]?.toLowerCase()
  return isSupportedLanguage(base) ? base : null
}
