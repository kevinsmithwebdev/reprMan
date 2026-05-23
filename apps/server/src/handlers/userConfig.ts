import { TERMS_VERSION } from '@reprman/shared/quota'
import { getUserId, UnauthorizedError } from '../lib/auth'
import { jsonResponse } from '../lib/http'
import { getUserConfig } from '../lib/reprStore'
import {
  resolveMaxReprsAllowed,
  resolvePracticeSettings,
} from '../lib/userConfig'

type Event = any
type Result = any

export const getUserConfigHandler = async (event: Event): Promise<Result> => {
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
    if (error instanceof UnauthorizedError) {
      return jsonResponse(401, { message: 'Unauthorized' })
    }
    return jsonResponse(500, { message: 'Internal server error' })
  }
}
