import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { runSaga } from 'redux-saga'

import { showPingWorker } from './showPing.saga'

describe('showPingWorker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('logs the payload after a delay', async () => {
    const promise = runSaga(
      {
        dispatch: () => undefined,
        getState: () => ({}),
      },
      showPingWorker,
      { payload: { msg: 'hello' } }
    ).toPromise()

    await vi.advanceTimersByTimeAsync(500)
    await promise

    expect(console.info).toHaveBeenCalledWith('SAGA worker PONG!!!')
    expect(console.info).toHaveBeenCalledWith('This is the payload:', {
      msg: 'hello',
    })
  })
})
