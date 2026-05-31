import {
  DEFAULT_MAX_REPRS_ALLOWED,
  keyForUserConfig,
  parseMaxReprsAllowed,
  resolveMaxReprsAllowed,
  resolvePracticeSettings,
  USER_CONFIG_SORT_KEY,
} from './userConfig'

describe('userConfig', () => {
  it('builds the config sort key', () => {
    expect(USER_CONFIG_SORT_KEY).toBe('CONFIG')
    expect(keyForUserConfig('user-1')).toEqual({
      pk: 'USER#user-1',
      sk: 'CONFIG',
    })
  })

  it('re-exports shared quota helpers', () => {
    expect(DEFAULT_MAX_REPRS_ALLOWED).toBeGreaterThan(0)
    expect(parseMaxReprsAllowed(3)).toBe(3)
    expect(resolveMaxReprsAllowed(null)).toBe(DEFAULT_MAX_REPRS_ALLOWED)
    expect(resolvePracticeSettings(null).practiceDelay).toBeGreaterThan(0)
  })
})
