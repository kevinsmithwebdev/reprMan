import { describe, expect, it } from 'vitest'

import { getUserInitials } from './getUserInitials'

describe('getUserInitials', () => {
  it('uses first and last initials from a multi-word name', () => {
    expect(getUserInitials({ email: 'a@b.com', name: 'Jane Doe' })).toBe('JD')
  })

  it('uses the first two letters of a single-word name', () => {
    expect(getUserInitials({ email: 'a@b.com', name: 'Cher' })).toBe('CH')
  })

  it('falls back to email local-part initials', () => {
    expect(getUserInitials({ email: 'alice@example.com' })).toBe('AL')
  })
})
