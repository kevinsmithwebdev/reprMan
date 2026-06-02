import { validatePracticeSettingsPayload } from '@reprman/shared/quota'
import { getUserId } from '../lib/auth'
import { mapHandlerError } from '../lib/handlerErrors'
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
    return mapHandlerError(error)
  }
}
