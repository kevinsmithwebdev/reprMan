import { getUserId, UnauthorizedError } from '../lib/auth'
import { trackAction, trackDailyUniqueUser } from '../lib/analytics'
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
import { resolveMaxReprsAllowed } from '../lib/userConfig'
import { parseRepr } from '../lib/reprValidation'

const reprLimitExceededResponse = (maxReprsAllowed: number) =>
  jsonResponse(403, {
    code: 'REPR_LIMIT_EXCEEDED',
    message: `You cannot create more than ${maxReprsAllowed} reprs.`,
    maxReprsAllowed,
  })

type Event = any
type Result = any

const handleError = (
  error: unknown,
  options: { defaultStatus: number; defaultMessage: string }
): Result => {
  if (error instanceof UnauthorizedError) {
    return jsonResponse(401, { message: 'Unauthorized' })
  }

  return jsonResponse(options.defaultStatus, {
    message: options.defaultMessage,
  })
}

export const getReprsHandler = async (event: Event): Promise<Result> => {
  try {
    const userId = getUserId(event)
    await trackDailyUniqueUser(userId)
    const [reprs] = await Promise.all([
      listReprs(userId),
      getUserConfig(userId),
    ])
    return jsonResponse(200, { reprs })
  } catch (error: unknown) {
    return handleError(error, {
      defaultStatus: 500,
      defaultMessage: 'Internal server error',
    })
  }
}

export const putReprHandler = async (event: Event): Promise<Result> => {
  try {
    const userId = getUserId(event)
    await trackDailyUniqueUser(userId)
    const payload = JSON.parse(event.body ?? '{}')
    const repr = parseRepr(payload)
    const pathReprId = event.pathParameters?.id
    if (!pathReprId || pathReprId !== repr.id) {
      return jsonResponse(400, { message: 'Path id and repr id must match' })
    }

    const [alreadyExists, config] = await Promise.all([
      reprExists(userId, repr.id),
      getUserConfig(userId),
    ])
    const maxReprsAllowed = resolveMaxReprsAllowed(config)

    if (!alreadyExists && maxReprsAllowed !== null) {
      const count = await countReprsForUser(userId)
      if (count >= maxReprsAllowed) {
        return reprLimitExceededResponse(maxReprsAllowed)
      }
    }

    const result = await upsertRepr(userId, repr)
    trackAction(result === 'created' ? 'create' : 'edit')
    return jsonResponse(200, { repr })
  } catch (error: unknown) {
    return handleError(error, {
      defaultStatus: 400,
      defaultMessage: 'Bad request',
    })
  }
}

export const markReprPracticedHandler = async (
  event: Event
): Promise<Result> => {
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
    return handleError(error, {
      defaultStatus: 400,
      defaultMessage: 'Bad request',
    })
  }
}

export const deleteReprHandler = async (event: Event): Promise<Result> => {
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
    return handleError(error, {
      defaultStatus: 400,
      defaultMessage: 'Bad request',
    })
  }
}
