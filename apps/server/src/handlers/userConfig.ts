import { resolveSubscription } from '@reprman/shared/subscription'
import { TERMS_VERSION } from '@reprman/shared/quota'
import { getUserId } from '../lib/auth'
import { mapHandlerError } from '../lib/handlerErrors'
import { jsonResponse } from '../lib/http'
import { getUserConfig } from '../lib/reprStore'
import { resolvePracticeSettings } from '../lib/userConfig'

export const getUserConfigHandler = async (event: any): Promise<any> => {
  try {
    const userId = getUserId(event)
    const config = await getUserConfig(userId)
    const subscription = resolveSubscription(config)
    const practiceSettings = resolvePracticeSettings(config)
    return jsonResponse(200, {
      subscription,
      maxReprsAllowed: subscription.maxReprs,
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
