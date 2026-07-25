import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PlatformStorage } from './storage.types'

export const createPlatformStorage = (): PlatformStorage => ({
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
})
