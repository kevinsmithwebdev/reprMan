import { describe, expect, it, vi, beforeEach } from 'vitest'
import { runSaga } from 'redux-saga'

import {
  setMaxReprsQuota,
  setSubscription,
  setTermsConfig,
} from '@reprman/state/reprsQuota'
import { setSettingsAC } from '@reprman/state/settings/settings.actions'
import { storeReprsSAC } from '../reprs.actions'
import { loadReprsWorker } from './loadReprs.saga'

const listReprs = vi.fn()
const getUserConfig = vi.fn()
let apiConfigured = false

vi.mock('@reprman/reprs-api', () => ({
  get isReprsApiConfigured() {
    return apiConfigured
  },
  ReprsApiModule: {
    getInstance: () => ({ listReprs, getUserConfig }),
  },
}))

describe('loadReprsWorker', () => {
  beforeEach(() => {
    apiConfigured = false
    listReprs.mockReset()
    getUserConfig.mockReset()
  })

  it('resets quota and stores an empty list when API is not configured', async () => {
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      loadReprsWorker
    ).toPromise()

    expect(dispatched).toEqual([setMaxReprsQuota(null), storeReprsSAC([])])
  })

  it('loads cloud reprs and user config when API is configured', async () => {
    apiConfigured = true
    listReprs.mockResolvedValue([
      {
        id: 'r1',
        title: 'Cloud',
        categories: [],
        dateCreated: 1,
        datesPracticed: [],
        comment: '',
        learning: false,
      },
    ])
    getUserConfig.mockResolvedValue({
      subscription: {
        status: 'trial',
        expiration: '2026-04-01T00:00:00.000Z',
        maxReprs: 100,
      },
      maxReprsAllowed: 100,
      practiceDelay: 14,
      warningRatio: 0.4,
      termsAcceptedAt: undefined,
      termsVersion: undefined,
      currentTermsVersion: '1',
    })

    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      loadReprsWorker
    ).toPromise()

    expect(dispatched).toContainEqual(
      setSettingsAC({ practiceDelay: 14, warningRatio: 0.4 })
    )
    expect(dispatched).toContainEqual(setMaxReprsQuota(100))
    expect(dispatched).toContainEqual(
      setSubscription({
        status: 'trial',
        expiration: '2026-04-01T00:00:00.000Z',
        maxReprs: 100,
      })
    )
    expect(dispatched).toContainEqual(
      setTermsConfig({
        termsAcceptedAt: null,
        termsVersion: null,
        currentTermsVersion: '1',
      })
    )
    expect(dispatched).toContainEqual(storeReprsSAC(expect.any(Array)))
  })

  it('falls back to empty reprs when the API throws', async () => {
    apiConfigured = true
    listReprs.mockRejectedValue(new Error('network'))
    getUserConfig.mockResolvedValue({
      subscription: {
        status: 'trial',
        expiration: '2026-04-01T00:00:00.000Z',
        maxReprs: 100,
      },
      maxReprsAllowed: 100,
      practiceDelay: 30,
      warningRatio: 0.5,
      termsAcceptedAt: undefined,
      termsVersion: undefined,
      currentTermsVersion: '1',
    })

    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      loadReprsWorker
    ).toPromise()

    expect(dispatched).toContainEqual(
      setSubscription({
        status: 'trial',
        expiration: '2026-04-01T00:00:00.000Z',
        maxReprs: 100,
      })
    )
    expect(dispatched).toContainEqual(storeReprsSAC([]))
  })

  it('resets quota when user config fails even if reprs would succeed', async () => {
    apiConfigured = true
    getUserConfig.mockRejectedValue(new Error('config failed'))
    listReprs.mockResolvedValue([])

    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      loadReprsWorker
    ).toPromise()

    expect(getUserConfig).toHaveBeenCalledTimes(3)
    expect(dispatched).toEqual([
      storeReprsSAC([]),
      setMaxReprsQuota(null),
      setSubscription({
        status: 'unlimited',
        expiration: null,
        maxReprs: null,
      }),
    ])
  }, 10_000)

  it('retries user config after reprs are stored', async () => {
    apiConfigured = true
    getUserConfig
      .mockRejectedValueOnce(new Error('auth pending'))
      .mockResolvedValueOnce({
        subscription: {
          status: 'trial',
          expiration: '2026-04-01T00:00:00.000Z',
          maxReprs: 100,
        },
        maxReprsAllowed: 100,
        practiceDelay: 30,
        warningRatio: 0.5,
        termsAcceptedAt: undefined,
        termsVersion: undefined,
        currentTermsVersion: '1',
      })
    listReprs.mockResolvedValue([])

    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      loadReprsWorker
    ).toPromise()

    expect(getUserConfig).toHaveBeenCalledTimes(2)
    expect(listReprs).toHaveBeenCalledTimes(1)
    expect(dispatched[0]).toEqual(storeReprsSAC([]))
    expect(dispatched).toContainEqual(setMaxReprsQuota(100))
  })
})
