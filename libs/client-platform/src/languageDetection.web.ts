import {
  isSupportedLanguage,
  languageFromLocaleTag,
  type SupportedLanguage,
} from '@reprman/localization/languageDetectionCore'
import type { PlatformStorage } from './storage.types'

export const readStoredLanguage = async (
  storage: PlatformStorage,
  storageKey: string
): Promise<SupportedLanguage | null> => {
  const stored = await storage.getItem(storageKey)
  return isSupportedLanguage(stored) ? stored : null
}

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

export const resolveInitialLanguage = async (
  storage: PlatformStorage,
  storageKey: string
): Promise<SupportedLanguage> =>
  (await readStoredLanguage(storage, storageKey)) ?? resolveBrowserLanguage()
