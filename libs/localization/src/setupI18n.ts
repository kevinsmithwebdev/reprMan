import i18next from 'i18next'
import moment from 'moment'
import 'moment/locale/de'
import 'moment/locale/es'
import 'moment/locale/fr'
import 'moment/locale/ja'
import 'moment/locale/ko'
import 'moment/locale/nl'
import 'moment/locale/pt'
import 'moment/locale/zh-cn'
import deL10ns from './de.json'
import enL10ns from './en.json'
import esL10ns from './es.json'
import frL10ns from './fr.json'
import jaL10ns from './ja.json'
import koL10ns from './ko.json'
import nlL10ns from './nl.json'
import ptL10ns from './pt.json'
import zhL10ns from './zh.json'
import {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  resolveInitialLanguage,
  type SupportedLanguage,
} from './languageDetection'

export {
  LANGUAGE_STORAGE_KEY,
  LANGUAGE_DISPLAY_ORDER,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from './languageDetection'

const MOMENT_LOCALES: Record<SupportedLanguage, string> = {
  en: 'en',
  es: 'es',
  pt: 'pt',
  fr: 'fr',
  de: 'de',
  nl: 'nl',
  ja: 'ja',
  zh: 'zh-cn',
  ko: 'ko',
}

const englishFallbackLng = Object.fromEntries(
  SUPPORTED_LANGUAGES.filter((lng) => lng !== 'en').map((lng) => [lng, ['en']])
) as Record<string, string[]>

const applyDocumentLanguage = (lng: string) => {
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.lang = lng
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
  fallbackLng: { ...englishFallbackLng, default: ['en'] },
  supportedLngs: [...SUPPORTED_LANGUAGES],
  nonExplicitSupportedLngs: true,
  debug: false,
  initImmediate: false,
  resources: {
    en: { translation: enL10ns },
    es: { translation: esL10ns },
    pt: { translation: ptL10ns },
    fr: { translation: frL10ns },
    de: { translation: deL10ns },
    nl: { translation: nlL10ns },
    ja: { translation: jaL10ns },
    zh: { translation: zhL10ns },
    ko: { translation: koL10ns },
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
