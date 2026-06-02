import { describe, expect, it } from 'vitest'

import { showPing } from './ping.actions'

describe('ping.actions', () => {
  it('creates showPing action', () => {
    expect(showPing({ msg: 'hello' })).toEqual({
      type: 'SAGA/SHOW_PING',
      payload: { msg: 'hello' },
    })
  })
})
