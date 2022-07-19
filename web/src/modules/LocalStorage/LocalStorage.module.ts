/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
import { Reprs } from 'types'
import { LocalStorageKey } from './LocalStorage.types'

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
    const value = localStorage.getItem(key)
    return value
  }

  private async setLocalStorage(
    key: LocalStorageKey,
    value: any
  ): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value))
  }

  // *************

  async getReprs(): Promise<Reprs> {
    const value = JSON.parse(await this.getLocalStorage(LocalStorageKey.REPRS))

    if (!value) {
      return [] as Reprs
    }
    return value
  }

  async setReprs(value: Reprs): Promise<void> {
    await this.setLocalStorage(LocalStorageKey.REPRS, value)
  }
}

export default LocalStorageModule
