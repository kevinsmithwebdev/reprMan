/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
import { Settings } from 'types'
import { LocalStorageKey, LS_KEY_PREFIX } from './LocalStorage.types'

class LocalStorageModule {
  private static instance: LocalStorageModule

  // eslint-disable-next-line no-empty-function
  private constructor() {}

  public static getInstance(): LocalStorageModule {
    if (!LocalStorageModule.instance) {
      LocalStorageModule.instance = new LocalStorageModule()
    }

    return LocalStorageModule.instance
  }

  // *************

  private async getLocalStorage(key: LocalStorageKey): Promise<any> {
    return localStorage.getItem(_buildKey(key))
  }

  private async setLocalStorage(
    key: LocalStorageKey,
    value: any
  ): Promise<void> {
    localStorage.setItem(_buildKey(key), JSON.stringify(value))
  }

  async getSettings(): Promise<Settings> {
    const value = JSON.parse(
      await this.getLocalStorage(LocalStorageKey.SETTINGS)
    )

    if (!value) {
      return {} as Settings
    }
    return value
  }

  async setSettings(value: Settings): Promise<void> {
    await this.setLocalStorage(LocalStorageKey.SETTINGS, value)
  }
}

export default LocalStorageModule

const _buildKey = (key: LocalStorageKey) => `${LS_KEY_PREFIX}/${key}`
