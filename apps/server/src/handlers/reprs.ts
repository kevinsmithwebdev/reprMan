import { getUserId } from '../lib/auth'
import { jsonResponse } from '../lib/http'
import {
  deleteRepr,
  listReprs,
  markPracticed,
  replaceAllReprs,
  upsertRepr,
} from '../lib/reprStore'
import { parseRepr, parseReprs } from '../lib/reprValidation'

type Event = any
type Result = any

export const getReprsHandler = async (event: Event): Promise<Result> => {
  try {
    const userId = getUserId(event)
    const reprs = await listReprs(userId)
    return jsonResponse(200, { reprs })
  } catch (error) {
    return jsonResponse(500, { message: (error as Error).message })
  }
}

export const putReprHandler = async (event: Event): Promise<Result> => {
  try {
    const userId = getUserId(event)
    const payload = JSON.parse(event.body ?? '{}')
    const repr = parseRepr(payload)
    const pathReprId = event.pathParameters?.id
    if (!pathReprId || pathReprId !== repr.id) {
      return jsonResponse(400, { message: 'Path id and repr id must match' })
    }

    await upsertRepr(userId, repr)
    return jsonResponse(200, { repr })
  } catch (error) {
    return jsonResponse(400, { message: (error as Error).message })
  }
}

export const markReprPracticedHandler = async (event: Event): Promise<Result> => {
  try {
    const userId = getUserId(event)
    const reprId = event.pathParameters?.id
    if (!reprId) {
      return jsonResponse(400, { message: 'Missing repr id' })
    }

    const repr = await markPracticed(userId, reprId)
    if (!repr) {
      return jsonResponse(404, { message: 'Not found' })
    }

    return jsonResponse(200, { repr })
  } catch (error) {
    return jsonResponse(400, { message: (error as Error).message })
  }
}

export const deleteReprHandler = async (event: Event): Promise<Result> => {
  try {
    const userId = getUserId(event)
    const reprId = event.pathParameters?.id
    if (!reprId) {
      return jsonResponse(400, { message: 'Missing repr id' })
    }

    await deleteRepr(userId, reprId)
    return jsonResponse(200, { ok: true })
  } catch (error) {
    return jsonResponse(400, { message: (error as Error).message })
  }
}

export const migrateReprsHandler = async (event: Event): Promise<Result> => {
  try {
    const userId = getUserId(event)
    const payload = JSON.parse(event.body ?? '[]')
    const reprs = parseReprs(payload)
    await replaceAllReprs(userId, reprs)
    return jsonResponse(200, { imported: reprs.length })
  } catch (error) {
    return jsonResponse(400, { message: (error as Error).message })
  }
}
