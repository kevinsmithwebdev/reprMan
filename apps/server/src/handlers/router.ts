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
import { matchesApiPath } from '../lib/apiRoutes'
import { getBuildInfo } from '../lib/config'

const serverBuildInfo = getBuildInfo()

console.info('[server-build]', serverBuildInfo)

type RouteHandler = (event: any) => Promise<any>

type RouteMatch = {
  method: string
  apiGatewayPath: string
  handler: RouteHandler
  rateLimitAction?: RateLimitAction
  requiresAuth?: boolean
}

const routes: RouteMatch[] = [
  {
    method: 'GET',
    apiGatewayPath: '/user/config',
    handler: (event) => getUserConfigHandler(event),
    rateLimitAction: 'read',
    requiresAuth: true,
  },
  {
    method: 'PATCH',
    apiGatewayPath: '/user/settings',
    handler: (event) => patchUserSettingsHandler(event),
    rateLimitAction: 'write',
    requiresAuth: true,
  },
  {
    method: 'POST',
    apiGatewayPath: '/user/terms-acceptance',
    handler: (event) => postTermsAcceptanceHandler(event),
    rateLimitAction: 'terms',
    requiresAuth: true,
  },
  {
    method: 'POST',
    apiGatewayPath: '/billing/checkout-session',
    handler: (event) => postCheckoutSessionHandler(event),
    rateLimitAction: 'billingSession',
    requiresAuth: true,
  },
  {
    method: 'POST',
    apiGatewayPath: '/billing/portal-session',
    handler: (event) => postPortalSessionHandler(event),
    rateLimitAction: 'billingSession',
    requiresAuth: true,
  },
  {
    method: 'POST',
    apiGatewayPath: '/billing/stripe-webhook',
    handler: (event) => postStripeWebhookHandler(event),
    requiresAuth: false,
  },
  {
    method: 'GET',
    apiGatewayPath: '/reprs',
    handler: (event) => getReprsHandler(event),
    rateLimitAction: 'read',
    requiresAuth: true,
  },
  {
    method: 'PUT',
    apiGatewayPath: '/reprs/{id}',
    handler: (event) => putReprHandler(event),
    rateLimitAction: 'write',
    requiresAuth: true,
  },
  {
    method: 'POST',
    apiGatewayPath: '/reprs/{id}/practice',
    handler: (event) => markReprPracticedHandler(event),
    rateLimitAction: 'practice',
    requiresAuth: true,
  },
  {
    method: 'DELETE',
    apiGatewayPath: '/reprs/{id}',
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
    (entry) =>
      entry.method === method && matchesApiPath(path, entry.apiGatewayPath)
  )
  if (route) {
    if (route.requiresAuth && route.rateLimitAction) {
      const userId = getUserId(event)
      const blocked = await enforceUserActionRateLimit(
        userId,
        route.rateLimitAction
      )
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
