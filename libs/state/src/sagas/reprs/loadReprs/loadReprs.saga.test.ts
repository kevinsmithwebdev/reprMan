import { describe, expect, it, vi, beforeEach } from 'vitest'
import { runSaga } from 'redux-saga'

import { resetMaxReprsQuota, setMaxReprsQuota, setTermsConfig } from '@reprman/state/reprsQuota'
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

    expect(dispatched).toEqual([resetMaxReprsQuota(), storeReprsSAC([])])
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
      maxReprsAllowed: 10,
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
    expect(dispatched).toContainEqual(setMaxReprsQuota(10))
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

    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      loadReprsWorker
    ).toPromise()

    expect(dispatched).toEqual([resetMaxReprsQuota(), storeReprsSAC([])])
  })
})
