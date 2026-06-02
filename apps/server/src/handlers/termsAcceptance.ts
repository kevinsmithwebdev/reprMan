import { TERMS_VERSION } from '@reprman/shared/quota'
import { getUserId } from '../lib/auth'
import { mapHandlerError } from '../lib/handlerErrors'
import { jsonResponse } from '../lib/http'
import { recordTermsAcceptance } from '../lib/reprStore'

type Event = {
  body?: string
  requestContext: { authorizer?: { jwt?: { claims?: { sub?: string } } } }
}

export const postTermsAcceptanceHandler = async (
  event: Event
): Promise<{ statusCode: number; body: string }> => {
  try {
    const userId = getUserId(event)
    let parsed: { termsVersion?: string } = {}
    if (event.body) {
      parsed = JSON.parse(event.body) as { termsVersion?: string }
    }
    const { termsVersion } = parsed
    if (termsVersion !== TERMS_VERSION) {
      return jsonResponse(400, {
        message: `termsVersion must be "${TERMS_VERSION}"`,
      })
    }

    const config = await recordTermsAcceptance(userId, termsVersion)
    return jsonResponse(200, {
      termsAcceptedAt: config.termsAcceptedAt,
      termsVersion: config.termsVersion,
      currentTermsVersion: TERMS_VERSION,
    })
  } catch (error: unknown) {
    return mapHandlerError(error)
  }
}
