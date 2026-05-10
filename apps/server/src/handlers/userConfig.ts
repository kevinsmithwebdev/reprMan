import { getUserId, UnauthorizedError } from '../lib/auth'
import { jsonResponse } from '../lib/http'
import { getUserConfig } from '../lib/reprStore'
import { resolveMaxReprsAllowed } from '../lib/userConfig'

type Event = any
type Result = any

export const getUserConfigHandler = async (event: Event): Promise<Result> => {
  try {
    const userId = getUserId(event)
    const config = await getUserConfig(userId)
    const maxReprsAllowed = resolveMaxReprsAllowed(config)
    return jsonResponse(200, { maxReprsAllowed })
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      return jsonResponse(401, { message: 'Unauthorized' })
    }
    return jsonResponse(500, { message: 'Internal server error' })
  }
}
