/* eslint-disable class-methods-use-this */
import i18next from './setupI18n'

class LocalizationModule {
  private static instance: LocalizationModule

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
