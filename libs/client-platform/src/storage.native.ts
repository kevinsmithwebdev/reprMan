import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PlatformStorage } from './storage.types'

export const createPlatformStorage = (): PlatformStorage => ({
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
})
