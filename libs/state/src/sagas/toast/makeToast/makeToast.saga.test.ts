import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { runSaga } from 'redux-saga'

import { addToastAC, removeToastAC } from '@reprman/state/toasts'
import { ToastLevel } from '@reprman/types'
import { makeToastWorker } from './makeToast.saga'

vi.mock('uuid', () => ({ v4: () => 'toast-id' }))

vi.mock('@reprman/localization/Localization.module', () => ({
  default: {
    getInstance: () => ({
      t: (key: string) => key,
    }),
  },
}))

describe('makeToastWorker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('adds a toast with a localized default title', async () => {
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      makeToastWorker,
      {
        payload: {
          body: 'Saved',
          level: ToastLevel.SUCCESS,
        },
      }
    ).toPromise()

    expect(dispatched[0]).toEqual(
      addToastAC({
        body: 'Saved',
        level: ToastLevel.SUCCESS,
        id: 'toast-id',
        title: 'COMMON.SUCCESS',
      })
    )
  })

  it('uses a custom title when provided', async () => {
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      makeToastWorker,
      {
        payload: {
          body: 'Note',
          level: ToastLevel.INFO,
          title: 'Custom',
        },
      }
    ).toPromise()

    expect(dispatched[0]).toEqual(
      addToastAC({
        body: 'Note',
        level: ToastLevel.INFO,
        id: 'toast-id',
        title: 'Custom',
      })
    )
  })

  it('uses an empty title when the level has no default mapping', async () => {
    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      makeToastWorker,
      {
        payload: {
          body: 'Note',
          level: 'unknown',
        },
      }
    ).toPromise()

    expect((dispatched[0] as ReturnType<typeof addToastAC>).payload.title).toBe(
      ''
    )
  })

  it('removes the toast after the delay', async () => {
    const dispatched: unknown[] = []
    const promise = runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      makeToastWorker,
      {
        payload: {
          body: 'Temporary',
          level: ToastLevel.WARNING,
          delay: 3000,
        },
      }
    ).toPromise()

    await vi.advanceTimersByTimeAsync(3000)
    await promise

    expect(dispatched[1]).toEqual(removeToastAC('toast-id'))
  })
})
