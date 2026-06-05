import i18next from 'i18next'
import moment from 'moment'
import 'moment/locale/es'
import enL10ns from './en.json'
import esL10ns from './es.json'

export const LANGUAGE_STORAGE_KEY = 'reprman-language'
export const SUPPORTED_LANGUAGES = ['en', 'es'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

const readStoredLanguage = (): SupportedLanguage | null => {
  if (typeof globalThis.localStorage === 'undefined') {
    return null
  }
  const stored = globalThis.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)
    ? (stored as SupportedLanguage)
    : null
}

const applyDocumentLanguage = (lng: string) => {
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.lang = lng
}

const applyMomentLocale = (lng: string) => {
  if (typeof moment.locale === 'function') {
    moment.locale(lng === 'es' ? 'es' : 'en')
  }
}

const initialLng = readStoredLanguage() ?? 'en'

i18next.init({
  lng: initialLng,
  fallbackLng: 'en',
  supportedLngs: [...SUPPORTED_LANGUAGES],
  debug: false,
  initImmediate: false,
  resources: {
    en: { translation: enL10ns },
    es: { translation: esL10ns },
  },
})

applyDocumentLanguage(initialLng)
applyMomentLocale(initialLng)

i18next.on('languageChanged', (lng) => {
  applyDocumentLanguage(lng)
  applyMomentLocale(lng)
  if (typeof globalThis.localStorage !== 'undefined') {
    globalThis.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
  }
})

export default i18next
