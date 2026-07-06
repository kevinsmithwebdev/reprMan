/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-empty-function */
import { fetchAuthSession } from 'aws-amplify/auth'
import {
  DEFAULT_PRACTICE_DELAY,
  DEFAULT_WARNING_RATIO,
  parseMaxReprsAllowed,
} from '@reprman/shared/quota'
import type {
  Subscription,
  SubscriptionStatus,
} from '@reprman/shared/subscription'
import { parseRepr, parseReprs } from '@reprman/shared/repr-validation'
import { Repr, Reprs, Settings } from '@reprman/types'

import { getClientConfig } from '@reprman/client-config'
import { ReprsApiError } from './ReprsApiError'
import type { ApiErrorPayload } from './ReprsApiError'

export type { ApiErrorPayload } from './ReprsApiError'
export { ReprsApiError, toUserFriendlyApiErrorMessage } from './ReprsApiError'

type Json = Record<string, unknown>

const SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus>([
  'trial',
  'unpaid',
  'paid',
  'unlimited',
])

export const parseSubscription = (raw: unknown): Subscription | undefined => {
  if (!raw || typeof raw !== 'object') {
    return undefined
  }
  const body = raw as Record<string, unknown>
  const { status } = body
  if (
    typeof status !== 'string' ||
    !SUBSCRIPTION_STATUSES.has(status as SubscriptionStatus)
  ) {
    return undefined
  }
  let expiration: string | null = null
  if (typeof body.expiration === 'string') {
    expiration = body.expiration
  } else if (body.expiration !== null && body.expiration !== undefined) {
    return undefined
  }
  let maxReprs: number | null | undefined
  if (body.maxReprs === null) {
    maxReprs = null
  } else if (typeof body.maxReprs === 'number') {
    maxReprs = body.maxReprs
  } else {
    maxReprs = undefined
  }
  if (maxReprs === undefined) {
    return undefined
  }
  return {
    status: status as SubscriptionStatus,
    expiration,
    maxReprs,
  }
}

export type UserConfigResponse = {
  subscription: Subscription
  maxReprsAllowed: number | null | undefined
  termsAcceptedAt?: string | null
  termsVersion?: string | null
  currentTermsVersion?: string | null
  practiceDelay: number
  warningRatio: number
}

export type TermsAcceptanceResponse = {
  termsAcceptedAt: string
  termsVersion: string
  currentTermsVersion: string
}

const trimUrl = (value: string): string => value.trim()

export let isReprsApiConfigured = false

/** Sync API availability from `setClientConfig()`. Call at app startup. */
export const configureReprsApi = (): void => {
  isReprsApiConfigured = Boolean(trimUrl(getClientConfig().reprsApiBaseUrl))
}

const assertConfigured = (): string => {
  const apiBaseUrl = trimUrl(getClientConfig().reprsApiBaseUrl)
  if (!apiBaseUrl) {
    throw new Error('reprs API base URL is not configured')
  }
  return apiBaseUrl
}

const getAccessToken = async (): Promise<string> => {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()
  if (!token) {
    throw new Error('User is not authenticated')
  }
  return token
}

const REQUEST_TIMEOUT_MS = 30_000

const request = async (
  path: string,
  method: string,
  body?: Json
): Promise<Json> => {
  const baseUrl = assertConfigured()
  const token = await getAccessToken()
  const maxRateLimitRetries = 3
  const maxRetryDelaySec = 10

  for (let attempt = 0; attempt <= maxRateLimitRetries; attempt += 1) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (
      response.status === 429 &&
      attempt < maxRateLimitRetries &&
      method === 'GET'
    ) {
      const text = await response.text()
      let retryDelaySec = 15
      if (text) {
        try {
          const parsed = JSON.parse(text) as ApiErrorPayload
          if (
            typeof parsed.retryAfterSeconds === 'number' &&
            Number.isFinite(parsed.retryAfterSeconds)
          ) {
            retryDelaySec = Math.min(parsed.retryAfterSeconds, maxRetryDelaySec)
          }
        } catch {
          // Use default retry delay for non-JSON 429 responses.
        }
      }
      await new Promise((resolve) => {
        setTimeout(resolve, retryDelaySec * 1000)
      })
      continue
    }

    if (!response.ok) {
      const text = await response.text()
      let payload: ApiErrorPayload | undefined
      let message = text || `Request failed (${response.status})`

      if (text) {
        try {
          const parsed = JSON.parse(text) as ApiErrorPayload
          payload = parsed
          if (typeof parsed.message === 'string' && parsed.message.trim()) {
            message = parsed.message
          }
        } catch {
          // Keep plain-text fallback message for non-JSON errors.
        }
      }

      throw new ReprsApiError(response.status, message, payload)
    }

    return response.json()
  }

  throw new ReprsApiError(429, 'Rate limit exceeded after retries')
}

class ReprsApiModule {
  private static instance: ReprsApiModule

  private constructor() {}

  static getInstance(): ReprsApiModule {
    if (!ReprsApiModule.instance) {
      ReprsApiModule.instance = new ReprsApiModule()
    }
    return ReprsApiModule.instance
  }

  async listReprs(): Promise<Reprs> {
    const data = await request('/reprs', 'GET')
    return parseReprs(data.reprs ?? [])
  }

  async getUserConfig(): Promise<UserConfigResponse> {
    const data = await request('/user/config', 'GET')
    const subscription = parseSubscription(data.subscription)
    if (!subscription) {
      throw new Error('Invalid subscription in user config response')
    }
    return {
      subscription,
      maxReprsAllowed: parseMaxReprsAllowed(data.maxReprsAllowed),
      termsAcceptedAt:
        typeof data.termsAcceptedAt === 'string' ? data.termsAcceptedAt : null,
      termsVersion:
        typeof data.termsVersion === 'string' ? data.termsVersion : null,
      currentTermsVersion:
        typeof data.currentTermsVersion === 'string'
          ? data.currentTermsVersion
          : null,
      practiceDelay:
        typeof data.practiceDelay === 'number'
          ? data.practiceDelay
          : DEFAULT_PRACTICE_DELAY,
      warningRatio:
        typeof data.warningRatio === 'number'
          ? data.warningRatio
          : DEFAULT_WARNING_RATIO,
    }
  }

  async createCheckoutSession(): Promise<{ url: string }> {
    const data = await request('/billing/checkout-session', 'POST')
    if (typeof data.url !== 'string' || !data.url) {
      throw new Error('Checkout session did not return a URL')
    }
    return { url: data.url }
  }

  async createPortalSession(): Promise<{ url: string }> {
    const data = await request('/billing/portal-session', 'POST')
    if (typeof data.url !== 'string' || !data.url) {
      throw new Error('Portal session did not return a URL')
    }
    return { url: data.url }
  }

  async updateUserSettings(settings: Settings): Promise<Settings> {
    const data = await request('/user/settings', 'PATCH', {
      practiceDelay: settings.practiceDelay,
      warningRatio: settings.warningRatio,
    })
    return {
      practiceDelay:
        typeof data.practiceDelay === 'number'
          ? data.practiceDelay
          : settings.practiceDelay,
      warningRatio:
        typeof data.warningRatio === 'number'
          ? data.warningRatio
          : settings.warningRatio,
    }
  }

  async acceptTerms(termsVersion: string): Promise<TermsAcceptanceResponse> {
    const data = await request('/user/terms-acceptance', 'POST', {
      termsVersion,
    })
    return data as unknown as TermsAcceptanceResponse
  }

  async upsertRepr(repr: Repr): Promise<Repr> {
    const data = await request(`/reprs/${repr.id}`, 'PUT', { ...repr })
    return parseRepr(data.repr)
  }

  async markReprPracticed(id: string): Promise<Repr> {
    const data = await request(`/reprs/${id}/practice`, 'POST')
    return parseRepr(data.repr)
  }

  async removeRepr(id: string): Promise<void> {
    await request(`/reprs/${id}`, 'DELETE')
  }
}

export default ReprsApiModule
