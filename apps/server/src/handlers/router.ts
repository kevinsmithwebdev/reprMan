import { jsonResponse } from '../lib/http'
import {
  deleteReprHandler,
  getReprsHandler,
  markReprPracticedHandler,
  migrateReprsHandler,
  putReprHandler,
} from './reprs'

type Event = any
type Result = any

export const handler = async (event: Event): Promise<Result> => {
  if (event.requestContext.http.method === 'GET' && event.rawPath === '/reprs') {
    return getReprsHandler(event)
  }

  if (event.requestContext.http.method === 'PUT' && event.rawPath.startsWith('/reprs/')) {
    return putReprHandler(event)
  }

  if (
    event.requestContext.http.method === 'POST' &&
    event.rawPath.startsWith('/reprs/') &&
    event.rawPath.endsWith('/practice')
  ) {
    return markReprPracticedHandler(event)
  }

  if (
    event.requestContext.http.method === 'DELETE' &&
    event.rawPath.startsWith('/reprs/')
  ) {
    return deleteReprHandler(event)
  }

  if (event.requestContext.http.method === 'POST' && event.rawPath === '/reprs/migrate') {
    return migrateReprsHandler(event)
  }

  return jsonResponse(404, { message: 'Not found' })
}
