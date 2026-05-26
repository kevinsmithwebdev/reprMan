/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-empty-function */
import { fetchAuthSession } from 'aws-amplify/auth'
import {
  DEFAULT_PRACTICE_DELAY,
  DEFAULT_WARNING_RATIO,
  parseMaxReprsAllowed,
} from '@reprman/shared/quota'
import { parseRepr, parseReprs } from '@reprman/shared/repr-validation'
import { Repr, Reprs, Settings } from '@reprman/types'

type Json = Record<string, unknown>

export type UserConfigResponse = {
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

const trimEnv = (v: string | undefined) => (v ?? '').trim()
const apiBaseUrl = trimEnv(import.meta.env.VITE_REPRS_API_BASE_URL)
export const isReprsApiConfigured = Boolean(apiBaseUrl)

const assertConfigured = (): string => {
  if (!apiBaseUrl) {
    throw new Error('VITE_REPRS_API_BASE_URL is not configured')
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

const request = async (
  path: string,
  method: string,
  body?: Json
): Promise<Json> => {
  const baseUrl = assertConfigured()
  const token = await getAccessToken()
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed (${response.status})`)
  }

  return response.json()
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
    return {
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
