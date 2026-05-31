import { jsonResponse } from '../lib/http'
import {
  deleteReprHandler,
  getReprsHandler,
  markReprPracticedHandler,
  putReprHandler,
} from './reprs'
import { getUserConfigHandler } from './userConfig'
import { patchUserSettingsHandler } from './patchUserSettings'
import { postTermsAcceptanceHandler } from './termsAcceptance'
import { postCheckoutSessionHandler } from './billing/checkoutSession'
import { postPortalSessionHandler } from './billing/portalSession'
import { postStripeWebhookHandler } from './billing/webhook'

const serverBuildInfo = {
  version: process.env.APP_VERSION ?? 'unknown',
  buildNumber: process.env.APP_BUILD_NUMBER ?? 'local',
  buildTimeUtc: process.env.APP_BUILD_TIME_UTC ?? 'unknown',
  gitSha: process.env.APP_GIT_SHA ?? 'unknown',
}

console.info('[server-build]', serverBuildInfo)

type RouteHandler = (event: any) => Promise<any>

type RouteMatch = {
  method: string
  matches: (path: string) => boolean
  handler: RouteHandler
}

const routes: RouteMatch[] = [
  {
    method: 'GET',
    matches: (path) => path === '/user/config',
    handler: (event) => getUserConfigHandler(event),
  },
  {
    method: 'PATCH',
    matches: (path) => path === '/user/settings',
    handler: (event) => patchUserSettingsHandler(event),
  },
  {
    method: 'POST',
    matches: (path) => path === '/user/terms-acceptance',
    handler: (event) => postTermsAcceptanceHandler(event),
  },
  {
    method: 'POST',
    matches: (path) => path === '/billing/checkout-session',
    handler: (event) => postCheckoutSessionHandler(event),
  },
  {
    method: 'POST',
    matches: (path) => path === '/billing/portal-session',
    handler: (event) => postPortalSessionHandler(event),
  },
  {
    method: 'POST',
    matches: (path) => path === '/billing/stripe-webhook',
    handler: (event) => postStripeWebhookHandler(event),
  },
  {
    method: 'GET',
    matches: (path) => path === '/reprs',
    handler: (event) => getReprsHandler(event),
  },
  {
    method: 'PUT',
    matches: (path) => path.startsWith('/reprs/'),
    handler: (event) => putReprHandler(event),
  },
  {
    method: 'POST',
    matches: (path) => path.startsWith('/reprs/') && path.endsWith('/practice'),
    handler: (event) => markReprPracticedHandler(event),
  },
  {
    method: 'DELETE',
    matches: (path) => path.startsWith('/reprs/'),
    handler: (event) => deleteReprHandler(event),
  },
]

export const handler = async (event: any): Promise<any> => {
  const {
    requestContext: {
      http: { method },
    },
    rawPath: path,
  } = event
  const route = routes.find(
    (entry) => entry.method === method && entry.matches(path)
  )
  if (route) {
    return route.handler(event)
  }
  return jsonResponse(404, { message: 'Not found' })
}
