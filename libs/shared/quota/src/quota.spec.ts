import {
  DEFAULT_MAX_REPRS_ALLOWED,
  DEFAULT_PRACTICE_DELAY,
  DEFAULT_WARNING_RATIO,
  parseMaxReprsAllowed,
  resolveMaxReprsAllowed,
  resolvePracticeSettings,
  validatePracticeSettingsPayload,
  type UserConfigItem,
} from './index'

describe('resolveMaxReprsAllowed', () => {
  it('uses DEFAULT_MAX_REPRS_ALLOWED when config is missing', () => {
    expect(resolveMaxReprsAllowed(null)).toBe(DEFAULT_MAX_REPRS_ALLOWED)
    expect(resolveMaxReprsAllowed(undefined)).toBe(DEFAULT_MAX_REPRS_ALLOWED)
  })

  it('uses default when item has no maxReprsAllowed attribute', () => {
    const item = { pk: 'USER#x', sk: 'CONFIG' } as UserConfigItem
    expect(resolveMaxReprsAllowed(item)).toBe(DEFAULT_MAX_REPRS_ALLOWED)
  })

  it('returns null for explicit unlimited', () => {
    const item: UserConfigItem = {
      pk: 'USER#x',
      sk: 'CONFIG',
      maxReprsAllowed: null,
    }
    expect(resolveMaxReprsAllowed(item)).toBeNull()
  })

  it('returns stored numeric cap', () => {
    const item: UserConfigItem = {
      pk: 'USER#x',
      sk: 'CONFIG',
      maxReprsAllowed: 100,
    }
    expect(resolveMaxReprsAllowed(item)).toBe(100)
  })
})

describe('parseMaxReprsAllowed', () => {
  it('returns null for explicit null', () => {
    expect(parseMaxReprsAllowed(null)).toBeNull()
  })

  it('returns the number for numeric input', () => {
    expect(parseMaxReprsAllowed(42)).toBe(42)
  })

  it('returns undefined for everything else', () => {
    expect(parseMaxReprsAllowed(undefined)).toBeUndefined()
    expect(parseMaxReprsAllowed('100')).toBeUndefined()
    expect(parseMaxReprsAllowed({})).toBeUndefined()
  })
})

describe('resolvePracticeSettings', () => {
  it('uses defaults when config is missing', () => {
    expect(resolvePracticeSettings(null)).toEqual({
      practiceDelay: DEFAULT_PRACTICE_DELAY,
      warningRatio: DEFAULT_WARNING_RATIO,
    })
  })

  it('returns stored values when present', () => {
    const item: UserConfigItem = {
      pk: 'USER#x',
      sk: 'CONFIG',
      practiceDelay: 14,
      warningRatio: 0.7,
    }
    expect(resolvePracticeSettings(item)).toEqual({
      practiceDelay: 14,
      warningRatio: 0.7,
    })
  })
})

describe('validatePracticeSettingsPayload', () => {
  it('accepts valid settings', () => {
    const result = validatePracticeSettingsPayload({
      practiceDelay: 21,
      warningRatio: 0.55,
    })
    expect(result).toEqual({
      ok: true,
      value: { practiceDelay: 21, warningRatio: 0.6 },
    })
  })

  it('rejects out-of-range practiceDelay', () => {
    const result = validatePracticeSettingsPayload({
      practiceDelay: 400,
      warningRatio: 0.5,
    })
    expect(result.ok).toBe(false)
  })
})
