import { TERMS_VERSION } from '@reprman/shared/quota'
import { getUserId } from '../lib/auth'
import { mapHandlerError } from '../lib/handlerErrors'
import { jsonResponse } from '../lib/http'
import { getUserConfig } from '../lib/reprStore'
import {
  resolveMaxReprsAllowed,
  resolvePracticeSettings,
} from '../lib/userConfig'

export const getUserConfigHandler = async (event: any): Promise<any> => {
  try {
    const userId = getUserId(event)
    const config = await getUserConfig(userId)
    const maxReprsAllowed = resolveMaxReprsAllowed(config)
    const practiceSettings = resolvePracticeSettings(config)
    return jsonResponse(200, {
      maxReprsAllowed,
      termsAcceptedAt: config.termsAcceptedAt ?? null,
      termsVersion: config.termsVersion ?? null,
      currentTermsVersion: TERMS_VERSION,
      practiceDelay: practiceSettings.practiceDelay,
      warningRatio: practiceSettings.warningRatio,
    })
  } catch (error: unknown) {
    return mapHandlerError(error)
  }
}
