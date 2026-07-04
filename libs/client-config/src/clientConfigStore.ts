import { ClientConfig, emptyClientConfig } from './types'

let config: ClientConfig = emptyClientConfig()

export const getClientConfig = (): ClientConfig => config

export const setClientConfig = (next: ClientConfig): void => {
  config = next
}

/** Test helper — resets module state between Vitest cases. */
export const resetClientConfig = (): void => {
  config = emptyClientConfig()
}
