import { describe, expect, it, vi, beforeEach } from 'vitest'
import { runSaga } from 'redux-saga'

import { setReprs } from '@reprman/state/reprs'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { ToastLevel } from '@reprman/types'
import { markReprPracticedWorker } from './markReprPracticed.saga'

const upsertRepr = vi.fn()
let apiConfigured = false

vi.mock('@reprman/reprs-api', () => ({
  get isReprsApiConfigured() {
    return apiConfigured
  },
  ReprsApiModule: {
    getInstance: () => ({ upsertRepr }),
  },
}))

vi.mock('moment', () => ({
  default: {
    utc: () => ({ valueOf: () => 1_700_000_000_000 }),
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

describe('markReprPracticedWorker', () => {
  beforeEach(() => {
    upsertRepr.mockReset()
    apiConfigured = false
  })

  it('returns early when the repr id is missing', async () => {
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [repr] }),
      },
      markReprPracticedWorker,
      { payload: 'missing' }
    ).toPromise()

    expect(dispatched).toEqual([])
  })

  it('moves the repr to the end with a practice date', async () => {
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [repr] }),
      },
      markReprPracticedWorker,
      { payload: 'r1' }
    ).toPromise()

    expect(dispatched).toHaveLength(1)
    const next = (dispatched[0] as ReturnType<typeof setReprs>).payload
    expect(next).toHaveLength(1)
    expect(next[0].datesPracticed).toContain(1_700_000_000_000)
  })

  it('upserts to API when configured', async () => {
    apiConfigured = true
    upsertRepr.mockResolvedValue(undefined)
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [repr] }),
      },
      markReprPracticedWorker,
      { payload: 'r1' }
    ).toPromise()

    expect(upsertRepr).toHaveBeenCalled()
    expect(dispatched).toHaveLength(1)
  })

  it('restores reprs when API upsert fails', async () => {
    apiConfigured = true
    upsertRepr.mockRejectedValue(new Error('fail'))
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({ reprs: [repr] }),
      },
      markReprPracticedWorker,
      { payload: 'r1' }
    ).toPromise()

    expect(dispatched).toContainEqual(setReprs([repr]))
    expect(dispatched).toContainEqual(
      makeToastSAC({
        body: 'Could not mark repr practiced. Your list was restored.',
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
  })
})
