import { validatePracticeSettingsPayload } from '@reprman/shared/quota'
import { getUserId, UnauthorizedError } from '../lib/auth'
import { jsonResponse } from '../lib/http'
import { getUserConfig, updateUserPracticeSettings } from '../lib/reprStore'
import { resolvePracticeSettings } from '../lib/userConfig'

type Event = {
  body?: string
  requestContext: { authorizer?: { jwt?: { claims?: { sub?: string } } } }
}

export const patchUserSettingsHandler = async (
  event: Event
): Promise<{ statusCode: number; body: string }> => {
  try {
    const userId = getUserId(event)
    let parsed: unknown = {}
    if (event.body) {
      parsed = JSON.parse(event.body) as unknown
    }
    const validation = validatePracticeSettingsPayload(parsed)
    if (!validation.ok) {
      return jsonResponse(400, { message: validation.message })
    }

    await updateUserPracticeSettings(userId, validation.value)
    const config = await getUserConfig(userId)
    const practiceSettings = resolvePracticeSettings(config)
    return jsonResponse(200, practiceSettings)
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      return jsonResponse(401, { message: 'Unauthorized' })
    }
    if (error instanceof SyntaxError) {
      return jsonResponse(400, { message: 'Invalid JSON body' })
    }
    return jsonResponse(500, { message: 'Internal server error' })
  }
}
