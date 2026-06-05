import i18next from 'i18next'
import moment from 'moment'
import 'moment/locale/es'
import 'moment/locale/pt'
import enL10ns from './en.json'
import esL10ns from './es.json'
import ptL10ns from './pt.json'
import {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  resolveInitialLanguage,
  type SupportedLanguage,
} from './languageDetection'

export {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from './languageDetection'

const applyDocumentLanguage = (lng: string) => {
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.lang = lng
}

const MOMENT_LOCALES: Record<SupportedLanguage, string> = {
  en: 'en',
  es: 'es',
  pt: 'pt',
}

const applyMomentLocale = (lng: string) => {
  if (typeof moment.locale === 'function') {
    const baseLng = lng.split('-')[0] as SupportedLanguage
    moment.locale(MOMENT_LOCALES[baseLng] ?? 'en')
  }
}

const initialLng = resolveInitialLanguage()

i18next.init({
  lng: initialLng,
  fallbackLng: {
    es: ['en'],
    pt: ['en'],
    default: ['en'],
  },
  supportedLngs: [...SUPPORTED_LANGUAGES],
  nonExplicitSupportedLngs: true,
  debug: false,
  initImmediate: false,
  resources: {
    en: { translation: enL10ns },
    es: { translation: esL10ns },
    pt: { translation: ptL10ns },
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
