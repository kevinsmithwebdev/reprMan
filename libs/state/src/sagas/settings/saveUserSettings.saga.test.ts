import { describe, expect, it, vi, beforeEach } from 'vitest'
import { runSaga } from 'redux-saga'

import { setSettingsAC } from '@reprman/state/settings/settings.actions'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { ToastLevel } from '@reprman/types'
import { saveUserSettingsWorker } from './saveUserSettings.saga'
import { saveUserSettingsSAC } from './settings.actions'

const updateUserSettings = vi.fn()
let apiConfigured = false

vi.mock('@reprman/reprs-api', () => ({
  get isReprsApiConfigured() {
    return apiConfigured
  },
  toUserFriendlyApiErrorMessage: (_error: unknown, fallback: string) =>
    fallback,
  ReprsApiModule: {
    getInstance: () => ({ updateUserSettings }),
  },
}))

describe('saveUserSettingsWorker', () => {
  beforeEach(() => {
    updateUserSettings.mockReset()
    apiConfigured = false
  })

  it('updates settings locally when API is not configured', async () => {
    const payload = { practiceDelay: 10, warningRatio: 0.5 }
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      saveUserSettingsWorker,
      saveUserSettingsSAC(payload)
    ).toPromise()

    expect(dispatched).toEqual([setSettingsAC(payload)])
  })

  it('persists settings through the API when configured', async () => {
    apiConfigured = true
    const payload = { practiceDelay: 10, warningRatio: 0.5 }
    updateUserSettings.mockResolvedValue({
      practiceDelay: 12,
      warningRatio: 0.6,
    })
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      saveUserSettingsWorker,
      saveUserSettingsSAC(payload)
    ).toPromise()

    expect(dispatched).toContainEqual(
      setSettingsAC({ practiceDelay: 12, warningRatio: 0.6 })
    )
    expect(dispatched).toContainEqual(
      makeToastSAC({
        body: 'Settings saved',
        level: ToastLevel.SUCCESS,
        delay: 3000,
      })
    )
  })

  it('shows a failure toast when API save fails', async () => {
    apiConfigured = true
    updateUserSettings.mockRejectedValue(new Error('fail'))
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      saveUserSettingsWorker,
      saveUserSettingsSAC({ practiceDelay: 10, warningRatio: 0.5 })
    ).toPromise()

    expect(dispatched).toContainEqual(
      makeToastSAC({
        body: 'Could not save settings',
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
  })
})
