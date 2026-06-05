import { useEffect } from 'react'
import { useL10n } from './Localization.hooks'

export const useDocumentMeta = () => {
  const { t, language } = useL10n()

  useEffect(() => {
    const description = document.querySelector('meta[name="description"]')
    if (description) {
      description.setAttribute('content', t('meta.description'))
    }

    const noscript = document.querySelector('noscript')
    if (noscript) {
      noscript.textContent = t('meta.noscript')
    }
  }, [language, t])
}
