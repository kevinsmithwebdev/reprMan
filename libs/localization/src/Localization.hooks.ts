import { useCallback, useEffect, useState } from 'react'
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

  const t = useCallback(
    (key: string, props?: object) => localization.t(key, props ?? {}),
    [language, localization]
  )

  const changeLanguage = useCallback(
    (lng: SupportedLanguage) => localization.changeLanguage(lng),
    [localization]
  )

  return {
    t,
    language,
    changeLanguage,
  }
}
