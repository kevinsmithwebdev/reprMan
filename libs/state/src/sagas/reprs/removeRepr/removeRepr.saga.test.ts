import { describe, expect, it, vi, beforeEach } from 'vitest'
import { runSaga } from 'redux-saga'

import { setReprs } from '@reprman/state/reprs'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { ToastLevel } from '@reprman/types'
import { removeReprWorker } from './removeRepr.saga'

const callConfirmation = vi.fn()
const removeReprApi = vi.fn()
let apiConfigured = false

vi.mock('@reprman/modals/Confirmation', () => ({
  callConfirmation: (...args: unknown[]) => callConfirmation(...args),
}))

vi.mock('@reprman/reprs-api', () => ({
  get isReprsApiConfigured() {
    return apiConfigured
  },
  ReprsApiModule: {
    getInstance: () => ({ removeRepr: removeReprApi }),
  },
}))

const repr = {
  id: 'r1',
  title: 'Piece',
  categories: [],
  dateCreated: 0,
  datesPracticed: [],
  comment: '',
  learning: false,
}

describe('removeReprWorker', () => {
  beforeEach(() => {
    callConfirmation.mockReset()
    removeReprApi.mockReset()
    apiConfigured = false
  })

  it('returns early when the repr id is missing', async () => {
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [repr] }),
      },
      removeReprWorker,
      { payload: 'missing' }
    ).toPromise()

    expect(dispatched).toEqual([])
  })

  it('does nothing when confirmation is declined', async () => {
    callConfirmation.mockResolvedValue(false)
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [repr] }),
      },
      removeReprWorker,
      { payload: 'r1' }
    ).toPromise()

    expect(dispatched).toEqual([])
  })

  it('removes the repr locally when confirmed', async () => {
    callConfirmation.mockResolvedValue(true)
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [repr] }),
      },
      removeReprWorker,
      { payload: 'r1' }
    ).toPromise()

    expect(dispatched).toContainEqual(setReprs([]))
  })

  it('calls API when configured and confirmed', async () => {
    apiConfigured = true
    callConfirmation.mockResolvedValue(true)
    removeReprApi.mockResolvedValue(undefined)
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [repr] }),
      },
      removeReprWorker,
      { payload: 'r1' }
    ).toPromise()

    expect(removeReprApi).toHaveBeenCalledWith('r1')
    expect(dispatched).toContainEqual(setReprs([]))
  })

  it('restores reprs and shows a toast when API removal fails', async () => {
    apiConfigured = true
    callConfirmation.mockResolvedValue(true)
    removeReprApi.mockRejectedValue(new Error('fail'))
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [repr] }),
      },
      removeReprWorker,
      { payload: 'r1' }
    ).toPromise()

    expect(dispatched).toContainEqual(setReprs([repr]))
    expect(dispatched).toContainEqual(
      makeToastSAC({
        body: 'Could not remove repr. Your list was restored.',
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
  })
})
