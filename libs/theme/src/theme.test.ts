import { describe, expect, it } from 'vitest'

import colors from './colors'
import light from './light'

describe('theme colors', () => {
  it('defines palette values', () => {
    expect(colors.darkGreen).toBe('#0f5f0f')
    expect(colors.success).toBe('green')
  })
})

describe('light theme', () => {
  it('maps semantic roles to palette colors', () => {
    expect(light.primaryBackground).toBe(colors.lightGreen)
    expect(light.failure).toBe(colors.danger)
  })
})
