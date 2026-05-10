import { jsonResponse } from '../lib/http'
import {
  deleteReprHandler,
  getReprsHandler,
  markReprPracticedHandler,
  putReprHandler,
} from './reprs'
import { getUserConfigHandler } from './userConfig'

type Event = any
type Result = any

const serverBuildInfo = {
  version: process.env.APP_VERSION ?? 'unknown',
  buildNumber: process.env.APP_BUILD_NUMBER ?? 'local',
  buildTimeUtc: process.env.APP_BUILD_TIME_UTC ?? 'unknown',
  gitSha: process.env.APP_GIT_SHA ?? 'unknown',
}

console.info('[server-build]', serverBuildInfo)

export const handler = async (event: Event): Promise<Result> => {
  if (
    event.requestContext.http.method === 'GET' &&
    event.rawPath === '/user/config'
  ) {
    return getUserConfigHandler(event)
  }

  if (
    event.requestContext.http.method === 'GET' &&
    event.rawPath === '/reprs'
  ) {
    return getReprsHandler(event)
  }

  if (
    event.requestContext.http.method === 'PUT' &&
    event.rawPath.startsWith('/reprs/')
  ) {
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

  return jsonResponse(404, { message: 'Not found' })
}
