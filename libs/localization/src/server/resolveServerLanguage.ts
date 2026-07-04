import { cookies, headers } from 'next/headers'
import {
  isSupportedLanguage,
  languageFromLocaleTag,
  LANGUAGE_STORAGE_KEY,
  type SupportedLanguage,
} from '../languageDetectionCore'

export const resolveServerLanguage = async (): Promise<SupportedLanguage> => {
  const cookieStore = await cookies()
  const cookieLang = cookieStore.get(LANGUAGE_STORAGE_KEY)?.value
  if (isSupportedLanguage(cookieLang)) {
    return cookieLang
  }

  const headerStore = await headers()
  const acceptLanguage = headerStore.get('accept-language')
  if (acceptLanguage) {
    for (const part of acceptLanguage.split(',')) {
      const tag = part.split(';')[0]?.trim()
      if (!tag) {
        continue
      }
      const lang = languageFromLocaleTag(tag)
      if (lang) {
        return lang
      }
    }
  }

  return 'en'
}
