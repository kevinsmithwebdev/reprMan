import { parseRepr } from '@reprman/shared/repr-validation'
import {
  isAtReprLimit,
  resolveSubscription,
} from '@reprman/shared/subscription'
import { getUserId } from '../lib/auth'
import { trackAction, trackDailyUniqueUser } from '../lib/analytics'
import { mapHandlerError } from '../lib/handlerErrors'
import { jsonResponse } from '../lib/http'
import {
  countReprsForUser,
  deleteRepr,
  getUserConfig,
  listReprs,
  markPracticed,
  reprExists,
  upsertRepr,
} from '../lib/reprStore'

const reprLimitReachedResponse = (maxReprs: number) =>
  jsonResponse(403, {
    code: 'REPR_LIMIT_REACHED',
    message: `Repr limit of ${maxReprs} reached.`,
    maxReprs,
  })

export const getReprsHandler = async (event: any): Promise<any> => {
  try {
    const userId = getUserId(event)
    await trackDailyUniqueUser(userId)
    const reprs = await listReprs(userId)
    return jsonResponse(200, { reprs })
  } catch (error: unknown) {
    return mapHandlerError(error)
  }
}

export const putReprHandler = async (event: any): Promise<any> => {
  try {
    const userId = getUserId(event)
    await trackDailyUniqueUser(userId)
    const payload = JSON.parse(event.body ?? '{}')
    const repr = parseRepr(payload)
    const pathReprId = event.pathParameters?.id
    if (!pathReprId || pathReprId !== repr.id) {
      return jsonResponse(400, { message: 'Path id and repr id must match' })
    }

    const exists = await reprExists(userId, repr.id)
    if (!exists) {
      const [config, count] = await Promise.all([
        getUserConfig(userId),
        countReprsForUser(userId),
      ])
      const subscription = resolveSubscription(config)

      if (
        subscription.maxReprs !== null &&
        isAtReprLimit(count, subscription)
      ) {
        return reprLimitReachedResponse(subscription.maxReprs)
      }
    }

    const result = await upsertRepr(userId, repr)
    trackAction(result === 'created' ? 'create' : 'edit')
    return jsonResponse(200, { repr })
  } catch (error: unknown) {
    return mapHandlerError(error, {
      defaultStatus: 400,
      defaultMessage: 'Bad request',
    })
  }
}

export const markReprPracticedHandler = async (event: any): Promise<any> => {
  try {
    const userId = getUserId(event)
    await trackDailyUniqueUser(userId)
    const reprId = event.pathParameters?.id
    if (!reprId) {
      return jsonResponse(400, { message: 'Missing repr id' })
    }

    const repr = await markPracticed(userId, reprId)
    if (!repr) {
      return jsonResponse(404, { message: 'Not found' })
    }

    trackAction('practice')
    return jsonResponse(200, { repr })
  } catch (error: unknown) {
    return mapHandlerError(error, {
      defaultStatus: 400,
      defaultMessage: 'Bad request',
    })
  }
}

export const deleteReprHandler = async (event: any): Promise<any> => {
  try {
    const userId = getUserId(event)
    await trackDailyUniqueUser(userId)
    const reprId = event.pathParameters?.id
    if (!reprId) {
      return jsonResponse(400, { message: 'Missing repr id' })
    }

    await deleteRepr(userId, reprId)
    trackAction('delete')
    return jsonResponse(200, { ok: true })
  } catch (error: unknown) {
    return mapHandlerError(error, {
      defaultStatus: 400,
      defaultMessage: 'Bad request',
    })
  }
}
