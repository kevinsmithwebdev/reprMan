import { resolveServerLanguage } from './resolveServerLanguage'
import { createTranslator, type ServerTranslator } from './translationBundles'
import type { SupportedLanguage } from '../languageDetectionCore'

export type ServerTranslation = {
  t: ServerTranslator
  language: SupportedLanguage
}

export const getServerTranslation = async (): Promise<ServerTranslation> => {
  const language = await resolveServerLanguage()
  const t = createTranslator(language)
  return { t, language }
}
