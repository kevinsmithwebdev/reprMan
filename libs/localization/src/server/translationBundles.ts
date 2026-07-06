import deL10ns from '../de.json'
import enL10ns from '../en.json'
import esL10ns from '../es.json'
import frL10ns from '../fr.json'
import jaL10ns from '../ja.json'
import koL10ns from '../ko.json'
import nlL10ns from '../nl.json'
import ptL10ns from '../pt.json'
import zhL10ns from '../zh.json'
import type { SupportedLanguage } from '../languageDetectionCore'

export const translationBundles: Record<
  SupportedLanguage,
  Record<string, unknown>
> = {
  en: enL10ns,
  es: esL10ns,
  pt: ptL10ns,
  fr: frL10ns,
  de: deL10ns,
  nl: nlL10ns,
  ja: jaL10ns,
  zh: zhL10ns,
  ko: koL10ns,
}

export type ServerTranslateOptions = {
  returnObjects?: boolean
  [key: string]: unknown
}

const getNested = (obj: Record<string, unknown>, path: string): unknown =>
  path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)

const interpolate = (
  value: string,
  options?: ServerTranslateOptions
): string => {
  if (!options) {
    return value
  }
  return value.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const replacement = options[token]
    if (replacement == null) {
      return ''
    }
    if (typeof replacement === 'string') {
      return replacement
    }
    if (typeof replacement === 'number' || typeof replacement === 'boolean') {
      return String(replacement)
    }
    return ''
  })
}

export const createTranslator = (language: SupportedLanguage) => {
  const bundle = translationBundles[language] ?? translationBundles.en
  const fallback = translationBundles.en

  const t = (key: string, options?: ServerTranslateOptions): unknown => {
    const value = getNested(bundle, key) ?? getNested(fallback, key)
    if (options?.returnObjects) {
      return value
    }
    if (typeof value === 'string') {
      return interpolate(value, options)
    }
    return key
  }

  return t as ServerTranslator
}

export type ServerTranslator = (
  key: string,
  options?: ServerTranslateOptions
) => string
