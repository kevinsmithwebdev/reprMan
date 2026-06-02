import { describe, expect, it } from 'vitest'
import { runSaga } from 'redux-saga'

import { clearAllCategoryData } from '@reprman/state/categories'
import { resetReprs } from '@reprman/state/reprs'
import { resetMaxReprsQuota } from '@reprman/state/reprsQuota'
import { loadReprsSAC } from '../reprs/reprs.actions'

import { runGenesisWorker } from './genesis.saga'

describe('runGenesisWorker', () => {
  it('resets state and loads reprs without clearing categories by default', async () => {
    const dispatched: unknown[] = []

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      runGenesisWorker,
      { type: 'SAGA/GENESIS' }
    ).toPromise()

    expect(dispatched).not.toContainEqual(clearAllCategoryData())
    expect(dispatched).toEqual([
      resetReprs(),
      resetMaxReprsQuota(),
      loadReprsSAC(),
    ])
  })

  it('clears category data when afterSignIn is set', async () => {
    const dispatched: unknown[] = []

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      runGenesisWorker,
      { type: 'SAGA/GENESIS', payload: { afterSignIn: true } }
    ).toPromise()

    expect(dispatched[0]).toEqual(clearAllCategoryData())
    expect(dispatched.slice(1)).toEqual([
      resetReprs(),
      resetMaxReprsQuota(),
      loadReprsSAC(),
    ])
  })
})
