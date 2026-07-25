import { createPlatformStorage } from '@reprman/client-platform/storage'
import { resolveInitialLanguage } from './languageDetection'
import { initI18n } from './initI18n'

export {
  LANGUAGE_STORAGE_KEY,
  LANGUAGE_DISPLAY_ORDER,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from './languageDetectionCore'

const i18next = initI18n({
  initialLanguage: resolveInitialLanguage(),
  storage: createPlatformStorage(),
  applyDocumentLanguage: true,
})

export default i18next
