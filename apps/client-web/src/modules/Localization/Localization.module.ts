/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
import i18next from 'i18next'
import enL10ns from './en.json'

class LocalizationModule {
  private static instance: LocalizationModule

  private constructor() {
    i18next.init({
      lng: 'en', // FIXME: detect language?
      debug: false,
      resources: { en: { translation: enL10ns } },
    })
  }

  public static getInstance(): LocalizationModule {
    if (!LocalizationModule.instance) {
      LocalizationModule.instance = new LocalizationModule()
    }

    return LocalizationModule.instance
  }

  t(key: string, props?: Object) {
    return i18next.t(key, props || {})
  }
}

export default LocalizationModule
