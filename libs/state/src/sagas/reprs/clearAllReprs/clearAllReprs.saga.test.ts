import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { runSaga } from 'redux-saga'
import LocalizationModule from '@reprman/localization/Localization.module'

import { clearCategories } from '@reprman/state/categories'
import { clearAllReprs } from '@reprman/state/reprs'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { ToastLevel } from '@reprman/types'
import { clearAllReprsWorker, clearThemAll } from './clearAllReprs.saga'

const callConfirmation = vi.fn()
const removeRepr = vi.fn()
let apiConfigured = false

vi.mock('@reprman/modals/Confirmation', () => ({
  callConfirmation: (...args: unknown[]) => callConfirmation(...args),
}))

vi.mock('@reprman/reprs-api', () => ({
  get isReprsApiConfigured() {
    return apiConfigured
  },
  ReprsApiModule: {
    getInstance: () => ({ removeRepr }),
  },
}))

describe('clearAllReprsWorker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    callConfirmation.mockReset()
    removeRepr.mockReset()
    apiConfigured = false
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns early when the first confirmation is declined', async () => {
    callConfirmation.mockResolvedValueOnce(false)
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [] }),
      },
      clearAllReprsWorker
    ).toPromise()

    expect(dispatched).toEqual([])
  })

  it('returns early when the second confirmation is declined', async () => {
    callConfirmation.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    const dispatched: unknown[] = []
    const promise = runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [] }),
      },
      clearAllReprsWorker
    ).toPromise()

    await vi.advanceTimersByTimeAsync(500)
    await promise

    expect(dispatched).toEqual([])
  })

  it('clears reprs and categories when both confirmations succeed', async () => {
    callConfirmation.mockResolvedValueOnce(true).mockResolvedValueOnce(true)
    const dispatched: unknown[] = []
    const promise = runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({
          reprs: [
            {
              id: 'r1',
              title: 'One',
              categories: [],
              dateCreated: 0,
              datesPracticed: [],
              comment: '',
              learning: false,
            },
          ],
        }),
      },
      clearAllReprsWorker
    ).toPromise()

    await vi.advanceTimersByTimeAsync(500)
    await promise

    expect(dispatched).toContainEqual(clearAllReprs())
    expect(dispatched).toContainEqual(clearCategories())
  })
})

describe('clearThemAll', () => {
  const repr = {
    id: 'r1',
    title: 'One',
    categories: [],
    dateCreated: 0,
    datesPracticed: [],
    comment: '',
    learning: false,
  }

  beforeEach(() => {
    removeRepr.mockReset()
    apiConfigured = false
  })

  it('clears locally without calling API when not configured', async () => {
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [repr] }),
      },
      clearThemAll
    ).toPromise()

    expect(removeRepr).not.toHaveBeenCalled()
    expect(dispatched).toEqual([clearAllReprs(), clearCategories()])
  })

  it('removes each repr via API when configured', async () => {
    apiConfigured = true
    removeRepr.mockResolvedValue(undefined)
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [repr, { ...repr, id: 'r2' }] }),
      },
      clearThemAll
    ).toPromise()

    expect(removeRepr).toHaveBeenCalledTimes(2)
    expect(dispatched).toEqual([clearAllReprs(), clearCategories()])
  })

  it('shows a failure toast when API removal throws', async () => {
    apiConfigured = true
    removeRepr.mockRejectedValue(new Error('fail'))
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({
          reprs: [
            {
              id: 'r1',
              title: 'One',
              categories: [],
              dateCreated: 0,
              datesPracticed: [],
              comment: '',
              learning: false,
            },
          ],
        }),
      },
      clearThemAll
    ).toPromise()

    expect(dispatched).toContainEqual(
      makeToastSAC({
        body: LocalizationModule.getInstance().t(
          'errors.couldNotClearAllReprs'
        ),
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
  })
})
