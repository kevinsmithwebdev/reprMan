import { describe, expect, it } from 'vitest'

import type { RootState } from '../store'
import { selectUser } from './user.selectors'

describe('user.selectors', () => {
  it('selectUser returns the user slice', () => {
    const user = { email: 'a@b.com' }
    expect(selectUser({ user } as RootState)).toEqual(user)
  })
})
