import { useEffect, useState } from 'react'
import LocalizationModule from './Localization.module'
import i18next from './setupI18n'
import type { SupportedLanguage } from './setupI18n'

export const useL10n = () => {
  const [language, setLanguage] = useState(i18next.language)
  const localization = LocalizationModule.getInstance()

  useEffect(() => {
    const onLanguageChanged = (lng: string) => setLanguage(lng)
    i18next.on('languageChanged', onLanguageChanged)
    return () => {
      i18next.off('languageChanged', onLanguageChanged)
    }
  }, [])

  return {
    t: localization.t,
    language,
    changeLanguage: (lng: SupportedLanguage) =>
      localization.changeLanguage(lng),
  }
}
