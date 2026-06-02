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
import { getUserId } from '../lib/auth'
import { enforceUserActionRateLimit, RateLimitAction } from '../lib/rateLimit'

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
  rateLimitAction?: RateLimitAction
  requiresAuth?: boolean
}

const routes: RouteMatch[] = [
  {
    method: 'GET',
    matches: (path) => path === '/user/config',
    handler: (event) => getUserConfigHandler(event),
    rateLimitAction: 'read',
    requiresAuth: true,
  },
  {
    method: 'PATCH',
    matches: (path) => path === '/user/settings',
    handler: (event) => patchUserSettingsHandler(event),
    rateLimitAction: 'write',
    requiresAuth: true,
  },
  {
    method: 'POST',
    matches: (path) => path === '/user/terms-acceptance',
    handler: (event) => postTermsAcceptanceHandler(event),
    rateLimitAction: 'terms',
    requiresAuth: true,
  },
  {
    method: 'POST',
    matches: (path) => path === '/billing/checkout-session',
    handler: (event) => postCheckoutSessionHandler(event),
    rateLimitAction: 'billingSession',
    requiresAuth: true,
  },
  {
    method: 'POST',
    matches: (path) => path === '/billing/portal-session',
    handler: (event) => postPortalSessionHandler(event),
    rateLimitAction: 'billingSession',
    requiresAuth: true,
  },
  {
    method: 'POST',
    matches: (path) => path === '/billing/stripe-webhook',
    handler: (event) => postStripeWebhookHandler(event),
    requiresAuth: false,
  },
  {
    method: 'GET',
    matches: (path) => path === '/reprs',
    handler: (event) => getReprsHandler(event),
    rateLimitAction: 'read',
    requiresAuth: true,
  },
  {
    method: 'PUT',
    matches: (path) => path.startsWith('/reprs/'),
    handler: (event) => putReprHandler(event),
    rateLimitAction: 'write',
    requiresAuth: true,
  },
  {
    method: 'POST',
    matches: (path) => path.startsWith('/reprs/') && path.endsWith('/practice'),
    handler: (event) => markReprPracticedHandler(event),
    rateLimitAction: 'practice',
    requiresAuth: true,
  },
  {
    method: 'DELETE',
    matches: (path) => path.startsWith('/reprs/'),
    handler: (event) => deleteReprHandler(event),
    rateLimitAction: 'write',
    requiresAuth: true,
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
    if (route.requiresAuth && route.rateLimitAction) {
      const userId = getUserId(event)
      const blocked = await enforceUserActionRateLimit(userId, route.rateLimitAction)
      if (blocked) {
        return jsonResponse(
          429,
          {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded. Please retry later.',
            limitKey: blocked.key,
            max: blocked.max,
            window: blocked.window,
            retryAfterSeconds: blocked.retryAfterSeconds,
          },
          { 'retry-after': String(blocked.retryAfterSeconds) }
        )
      }
    }
    return route.handler(event)
  }
  return jsonResponse(404, { message: 'Not found' })
}
