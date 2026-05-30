import { describe, expect, it } from 'vitest'

import reducer from './user.reducer'
import { clearUser, setUser } from './user.actions'

const initialState = { email: '' }

describe('user.reducer', () => {
  it('returns initial state for unknown action', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('setUser replaces state', () => {
    const user = { email: 'test@example.com' }
    expect(reducer(initialState, setUser(user))).toEqual(user)
  })

  it('clearUser resets to initial', () => {
    expect(reducer({ email: 'x' }, clearUser())).toEqual(initialState)
  })
})
