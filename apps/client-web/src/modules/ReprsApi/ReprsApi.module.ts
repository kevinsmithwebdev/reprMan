/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-empty-function */
import { fetchAuthSession } from 'aws-amplify/auth'
import { Repr, Reprs } from 'types'

type Json = Record<string, unknown>

export type UserConfigResponse = {
  maxReprsAllowed: number | null | undefined
}

const trimEnv = (v: string | undefined) => (v ?? '').trim()
const apiBaseUrl = trimEnv(process.env.REACT_APP_REPRS_API_BASE_URL)
export const isReprsApiConfigured = Boolean(apiBaseUrl)

const assertConfigured = (): string => {
  if (!apiBaseUrl) {
    throw new Error('REACT_APP_REPRS_API_BASE_URL is not configured')
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
  body?: Json | Reprs
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

const parseMaxReprsAllowed = (raw: unknown): number | null | undefined => {
  if (raw === null) {
    return null
  }
  if (typeof raw === 'number') {
    return raw
  }
  return undefined
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
    return (data.reprs ?? []) as Reprs
  }

  async getUserConfig(): Promise<UserConfigResponse> {
    const data = await request('/user/config', 'GET')
    return { maxReprsAllowed: parseMaxReprsAllowed(data.maxReprsAllowed) }
  }

  async upsertRepr(repr: Repr): Promise<Repr> {
    const data = await request(
      `/reprs/${repr.id}`,
      'PUT',
      repr as unknown as Json
    )
    return data.repr as Repr
  }

  async markReprPracticed(id: string): Promise<Repr> {
    const data = await request(`/reprs/${id}/practice`, 'POST')
    return data.repr as Repr
  }

  async removeRepr(id: string): Promise<void> {
    await request(`/reprs/${id}`, 'DELETE')
  }

  async migrateReprs(reprs: Reprs): Promise<void> {
    await request('/reprs/migrate', 'POST', reprs)
  }
}

export default ReprsApiModule
