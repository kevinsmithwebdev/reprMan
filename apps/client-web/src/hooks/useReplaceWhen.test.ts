import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { navigationMocks } from '../test-utils'
import { useReplaceWhen } from './useReplaceWhen'

describe('useReplaceWhen', () => {
  beforeEach(() => {
    navigationMocks.replace.mockClear()
  })

  it('replaces the route when the condition is true', () => {
    renderHook(() => useReplaceWhen(true, '/signin'))
    expect(navigationMocks.replace).toHaveBeenCalledWith('/signin')
  })

  it('does not replace when the condition is false', () => {
    renderHook(() => useReplaceWhen(false, '/signin'))
    expect(navigationMocks.replace).not.toHaveBeenCalled()
  })
})
