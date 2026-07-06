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
    const matchedLang = acceptLanguage
      .split(',')
      .map((part) => part.split(';')[0]?.trim())
      .filter((tag): tag is string => Boolean(tag))
      .map((tag) => languageFromLocaleTag(tag))
      .find((lang): lang is SupportedLanguage => Boolean(lang))

    if (matchedLang) {
      return matchedLang
    }
  }

  return 'en'
}
