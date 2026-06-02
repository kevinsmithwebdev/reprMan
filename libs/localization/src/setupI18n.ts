import i18next from 'i18next'
import enL10ns from './en.json'

i18next.init({
  lng: 'en',
  debug: false,
  initImmediate: false,
  resources: { en: { translation: enL10ns } },
})

export default i18next
