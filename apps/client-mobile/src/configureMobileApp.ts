import { createExpoClientConfig } from '@reprman/client-config/createExpoClientConfig'
import { setClientConfig } from '@reprman/client-config'
import { configureAmplify } from '@reprman/cognito-auth'
import { configureReprsApi } from '@reprman/reprs-api'
import { createPlatformStorage } from '@reprman/client-platform/storage.native'
import { resolveInitialLanguage } from '@reprman/client-platform/languageDetection.native'
import { initI18n, LANGUAGE_STORAGE_KEY } from '@reprman/localization'

let configured = false

export const configureMobileApp = async (): Promise<void> => {
  if (configured) {
    return
  }

  setClientConfig(createExpoClientConfig())
  configureReprsApi()
  configureAmplify()

  const storage = createPlatformStorage()
  const initialLanguage = await resolveInitialLanguage(
    storage,
    LANGUAGE_STORAGE_KEY
  )
  initI18n({
    initialLanguage,
    storage,
    applyDocumentLanguage: false,
  })

  configured = true
}
