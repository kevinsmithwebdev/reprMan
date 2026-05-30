import { fetchAuthSession } from 'aws-amplify/auth'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Repr } from '@reprman/types'

const fetchMock = vi.fn()

vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: vi.fn(),
}))

const validRepr: Repr = {
  id: 'repr-1',
  title: 'Test repr',
  categories: ['music'],
  dateCreated: 1_000,
  datesPracticed: [2_000],
  comment: 'A comment',
  learning: false,
}

const loadModule = async () => {
  vi.resetModules()
  const mod = await import('./ReprsApi.module')
  return mod.default
}

describe('ReprsApi.module', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.mocked(fetchAuthSession).mockResolvedValue({
      tokens: { accessToken: { toString: () => 'test-token' } },
    } as Awaited<ReturnType<typeof fetchAuthSession>>)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  describe('isReprsApiConfigured', () => {
    it('is true when base URL is set', async () => {
      vi.stubEnv('VITE_REPRS_API_BASE_URL', 'https://api.example.com')
      const { isReprsApiConfigured } = await import('./ReprsApi.module')
      expect(isReprsApiConfigured).toBe(true)
    })

    it('is false when base URL is empty', async () => {
      vi.stubEnv('VITE_REPRS_API_BASE_URL', '   ')
      const { isReprsApiConfigured } = await import('./ReprsApi.module')
      expect(isReprsApiConfigured).toBe(false)
    })
  })

  describe('request (via public API)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_REPRS_API_BASE_URL', 'https://api.example.com')
    })

    it('throws when API is not configured', async () => {
      vi.stubEnv('VITE_REPRS_API_BASE_URL', '')
      const ReprsApiModule = await loadModule()
      await expect(ReprsApiModule.getInstance().listReprs()).rejects.toThrow(
        'VITE_REPRS_API_BASE_URL is not configured'
      )
    })

    it('throws when user is not authenticated', async () => {
      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: undefined,
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      const ReprsApiModule = await loadModule()
      await expect(ReprsApiModule.getInstance().listReprs()).rejects.toThrow(
        'User is not authenticated'
      )
    })

    it('sends authorized JSON requests and throws on failed responses', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      })
      const ReprsApiModule = await loadModule()
      await expect(ReprsApiModule.getInstance().listReprs()).rejects.toThrow(
        'Server error'
      )
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/reprs',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            authorization: 'Bearer test-token',
          },
        })
      )
    })

    it('uses status fallback when error response has no body', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => '',
      })
      const ReprsApiModule = await loadModule()
      await expect(ReprsApiModule.getInstance().listReprs()).rejects.toThrow(
        'Request failed (404)'
      )
    })
  })

  describe('listReprs', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_REPRS_API_BASE_URL', 'https://api.example.com')
    })

    it('parses reprs from GET /reprs', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reprs: [validRepr] }),
      })
      const ReprsApiModule = await loadModule()
      await expect(ReprsApiModule.getInstance().listReprs()).resolves.toEqual([
        validRepr,
      ])
    })

    it('returns empty list when reprs field is missing', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      const ReprsApiModule = await loadModule()
      await expect(ReprsApiModule.getInstance().listReprs()).resolves.toEqual(
        []
      )
    })
  })

  describe('ReprsApiModule singleton', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_REPRS_API_BASE_URL', 'https://api.example.com')
    })

    it('returns the same instance from getInstance', async () => {
      const ReprsApiModule = await loadModule()
      expect(ReprsApiModule.getInstance()).toBe(ReprsApiModule.getInstance())
    })
  })

  describe('getUserConfig', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_REPRS_API_BASE_URL', 'https://api.example.com')
    })

    it('maps user config fields with defaults', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          maxReprsAllowed: 5,
          termsAcceptedAt: '2024-01-01',
          termsVersion: 'v1',
          currentTermsVersion: 'v2',
          practiceDelay: 45,
          warningRatio: 0.75,
        }),
      })
      const ReprsApiModule = await loadModule()
      await expect(
        ReprsApiModule.getInstance().getUserConfig()
      ).resolves.toEqual({
        maxReprsAllowed: 5,
        termsAcceptedAt: '2024-01-01',
        termsVersion: 'v1',
        currentTermsVersion: 'v2',
        practiceDelay: 45,
        warningRatio: 0.75,
      })
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/user/config',
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('falls back to default settings for invalid numbers', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          maxReprsAllowed: null,
          practiceDelay: 'bad',
          warningRatio: null,
        }),
      })
      const ReprsApiModule = await loadModule()
      await expect(
        ReprsApiModule.getInstance().getUserConfig()
      ).resolves.toEqual({
        maxReprsAllowed: null,
        termsAcceptedAt: null,
        termsVersion: null,
        currentTermsVersion: null,
        practiceDelay: 30,
        warningRatio: 0.5,
      })
    })
  })

  describe('updateUserSettings', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_REPRS_API_BASE_URL', 'https://api.example.com')
    })

    it('PATCHes settings and returns parsed response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ practiceDelay: 60, warningRatio: 0.25 }),
      })
      const ReprsApiModule = await loadModule()
      await expect(
        ReprsApiModule.getInstance().updateUserSettings({
          practiceDelay: 30,
          warningRatio: 0.5,
        })
      ).resolves.toEqual({ practiceDelay: 60, warningRatio: 0.25 })
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/user/settings',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ practiceDelay: 30, warningRatio: 0.5 }),
        })
      )
    })

    it('keeps submitted settings when response omits fields', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      const ReprsApiModule = await loadModule()
      await expect(
        ReprsApiModule.getInstance().updateUserSettings({
          practiceDelay: 40,
          warningRatio: 0.6,
        })
      ).resolves.toEqual({ practiceDelay: 40, warningRatio: 0.6 })
    })
  })

  describe('upsertRepr', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_REPRS_API_BASE_URL', 'https://api.example.com')
    })

    it('PUTs repr payload and parses response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repr: validRepr }),
      })
      const ReprsApiModule = await loadModule()
      await expect(
        ReprsApiModule.getInstance().upsertRepr(validRepr)
      ).resolves.toEqual(validRepr)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/reprs/repr-1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(validRepr),
        })
      )
    })
  })

  describe('markReprPracticed', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_REPRS_API_BASE_URL', 'https://api.example.com')
    })

    it('POSTs to practice endpoint and parses repr', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          repr: { ...validRepr, datesPracticed: [2_000, 3_000] },
        }),
      })
      const ReprsApiModule = await loadModule()
      await expect(
        ReprsApiModule.getInstance().markReprPracticed('repr-1')
      ).resolves.toEqual({
        ...validRepr,
        datesPracticed: [2_000, 3_000],
      })
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/reprs/repr-1/practice',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('removeRepr', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_REPRS_API_BASE_URL', 'https://api.example.com')
    })

    it('DELETEs repr by id', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      const ReprsApiModule = await loadModule()
      await expect(
        ReprsApiModule.getInstance().removeRepr('repr-1')
      ).resolves.toBeUndefined()
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/reprs/repr-1',
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('acceptTerms', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_REPRS_API_BASE_URL', 'https://api.example.com')
    })

    it('POSTs terms version and returns acceptance payload', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          termsAcceptedAt: '2024-06-01T00:00:00Z',
          termsVersion: 'v3',
          currentTermsVersion: 'v3',
        }),
      })
      const ReprsApiModule = await loadModule()
      await expect(
        ReprsApiModule.getInstance().acceptTerms('v3')
      ).resolves.toEqual({
        termsAcceptedAt: '2024-06-01T00:00:00Z',
        termsVersion: 'v3',
        currentTermsVersion: 'v3',
      })
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/user/terms-acceptance',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ termsVersion: 'v3' }),
        })
      )
    })
  })
})
