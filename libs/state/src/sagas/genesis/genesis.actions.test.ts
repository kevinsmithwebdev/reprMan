import { describe, expect, it } from 'vitest'

import { RUN_GENESIS, runGenesisSaga } from './genesis.actions'

describe('genesis saga actions', () => {
  it('runGenesisSaga', () => {
    expect(runGenesisSaga({ afterSignIn: true })).toEqual({
      type: RUN_GENESIS,
      payload: { afterSignIn: true },
    })
    expect(runGenesisSaga()).toEqual({ type: RUN_GENESIS, payload: undefined })
  })
})
