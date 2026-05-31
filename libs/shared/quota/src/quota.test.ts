import {
  DEFAULT_MAX_REPRS_ALLOWED,
  DEFAULT_PRACTICE_DELAY,
  DEFAULT_WARNING_RATIO,
  parseMaxReprsAllowed,
  PRACTICE_DELAY_MAX,
  PRACTICE_DELAY_MIN,
  resolveMaxReprsAllowed,
  resolvePracticeDelay,
  resolvePracticeSettings,
  resolveWarningRatio,
  validatePracticeSettingsPayload,
} from './index'

describe('quota', () => {
  describe('DEFAULT_MAX_REPRS_ALLOWED', () => {
    const envKey = 'DEFAULT_MAX_REPRS_ALLOWED'

    afterEach(() => {
      delete process.env[envKey]
      jest.resetModules()
    })

    async function loadQuotaModule() {
      jest.resetModules()
      return import('./index')
    }

    it('falls back to 25 when env is invalid or negative', async () => {
      process.env[envKey] = 'not-a-number'
      await expect(loadQuotaModule()).resolves.toMatchObject({
        DEFAULT_MAX_REPRS_ALLOWED: 25,
      })

      process.env[envKey] = '-1'
      await expect(loadQuotaModule()).resolves.toMatchObject({
        DEFAULT_MAX_REPRS_ALLOWED: 25,
      })
    })

    it('uses a valid non-negative env value', async () => {
      process.env[envKey] = '50'
      await expect(loadQuotaModule()).resolves.toMatchObject({
        DEFAULT_MAX_REPRS_ALLOWED: 50,
      })
    })

    it('exports the module default when env is unset', () => {
      expect(DEFAULT_MAX_REPRS_ALLOWED).toBe(25)
    })
  })

  describe('resolveMaxReprsAllowed', () => {
    it('returns default when item is missing', () => {
      expect(resolveMaxReprsAllowed(null)).toBe(DEFAULT_MAX_REPRS_ALLOWED)
      expect(resolveMaxReprsAllowed(undefined)).toBe(DEFAULT_MAX_REPRS_ALLOWED)
    })

    it('returns default when maxReprsAllowed key is absent', () => {
      expect(resolveMaxReprsAllowed({ pk: 'u', sk: 'config' })).toBe(
        DEFAULT_MAX_REPRS_ALLOWED
      )
    })

    it('returns null for explicit unlimited', () => {
      expect(
        resolveMaxReprsAllowed({ pk: 'u', sk: 'config', maxReprsAllowed: null })
      ).toBeNull()
    })

    it('returns the configured cap', () => {
      expect(
        resolveMaxReprsAllowed({ pk: 'u', sk: 'config', maxReprsAllowed: 10 })
      ).toBe(10)
    })

    it('returns null when key is present but value is undefined', () => {
      expect(
        resolveMaxReprsAllowed({
          pk: 'u',
          sk: 'config',
          maxReprsAllowed: undefined,
        })
      ).toBeNull()
    })
  })

  describe('parseMaxReprsAllowed', () => {
    it('maps null to unlimited', () => {
      expect(parseMaxReprsAllowed(null)).toBeNull()
    })

    it('passes through numbers', () => {
      expect(parseMaxReprsAllowed(42)).toBe(42)
    })

    it('returns undefined for other values', () => {
      expect(parseMaxReprsAllowed(undefined)).toBeUndefined()
      expect(parseMaxReprsAllowed('25')).toBeUndefined()
    })
  })

  describe('resolvePracticeDelay', () => {
    it('returns default when missing or invalid', () => {
      expect(resolvePracticeDelay(null)).toBe(DEFAULT_PRACTICE_DELAY)
      expect(resolvePracticeDelay({ pk: 'u', sk: 'config' })).toBe(
        DEFAULT_PRACTICE_DELAY
      )
      expect(
        resolvePracticeDelay({ pk: 'u', sk: 'config', practiceDelay: NaN })
      ).toBe(DEFAULT_PRACTICE_DELAY)
      expect(
        resolvePracticeDelay({
          pk: 'u',
          sk: 'config',
          practiceDelay: '30' as unknown as number,
        })
      ).toBe(DEFAULT_PRACTICE_DELAY)
    })

    it('rounds and clamps to allowed range', () => {
      expect(
        resolvePracticeDelay({ pk: 'u', sk: 'config', practiceDelay: 45.6 })
      ).toBe(46)
      expect(
        resolvePracticeDelay({ pk: 'u', sk: 'config', practiceDelay: -5 })
      ).toBe(PRACTICE_DELAY_MIN)
      expect(
        resolvePracticeDelay({
          pk: 'u',
          sk: 'config',
          practiceDelay: PRACTICE_DELAY_MAX + 10,
        })
      ).toBe(PRACTICE_DELAY_MAX)
    })
  })

  describe('resolveWarningRatio', () => {
    it('returns default when missing or invalid', () => {
      expect(resolveWarningRatio(null)).toBe(DEFAULT_WARNING_RATIO)
      expect(resolveWarningRatio({ pk: 'u', sk: 'config' })).toBe(
        DEFAULT_WARNING_RATIO
      )
      expect(
        resolveWarningRatio({ pk: 'u', sk: 'config', warningRatio: Infinity })
      ).toBe(DEFAULT_WARNING_RATIO)
    })

    it('rounds to one decimal and clamps between 0 and 1', () => {
      expect(
        resolveWarningRatio({ pk: 'u', sk: 'config', warningRatio: 0.66 })
      ).toBe(0.7)
      expect(
        resolveWarningRatio({ pk: 'u', sk: 'config', warningRatio: -0.2 })
      ).toBe(0)
      expect(
        resolveWarningRatio({ pk: 'u', sk: 'config', warningRatio: 1.5 })
      ).toBe(1)
    })
  })

  describe('resolvePracticeSettings', () => {
    it('combines delay and warning ratio', () => {
      expect(
        resolvePracticeSettings({
          pk: 'u',
          sk: 'config',
          practiceDelay: 14,
          warningRatio: 0.3,
        })
      ).toEqual({ practiceDelay: 14, warningRatio: 0.3 })
    })
  })

  describe('validatePracticeSettingsPayload', () => {
    it('rejects non-object bodies', () => {
      expect(validatePracticeSettingsPayload(null)).toEqual({
        ok: false,
        message: 'Request body must be a JSON object',
      })
      expect(validatePracticeSettingsPayload('bad')).toEqual({
        ok: false,
        message: 'Request body must be a JSON object',
      })
    })

    it('rejects invalid practiceDelay', () => {
      expect(
        validatePracticeSettingsPayload({
          practiceDelay: '30',
          warningRatio: 0.5,
        })
      ).toEqual({
        ok: false,
        message: 'practiceDelay must be a finite number',
      })
      expect(
        validatePracticeSettingsPayload({
          practiceDelay: NaN,
          warningRatio: 0.5,
        })
      ).toEqual({
        ok: false,
        message: 'practiceDelay must be a finite number',
      })
    })

    it('rejects invalid warningRatio', () => {
      expect(
        validatePracticeSettingsPayload({
          practiceDelay: 30,
          warningRatio: null,
        })
      ).toEqual({
        ok: false,
        message: 'warningRatio must be a finite number',
      })
    })

    it('rejects out-of-range practiceDelay', () => {
      expect(
        validatePracticeSettingsPayload({
          practiceDelay: -1,
          warningRatio: 0.5,
        })
      ).toEqual({
        ok: false,
        message: `practiceDelay must be between ${PRACTICE_DELAY_MIN} and ${PRACTICE_DELAY_MAX}`,
      })
      expect(
        validatePracticeSettingsPayload({
          practiceDelay: PRACTICE_DELAY_MAX + 1,
          warningRatio: 0.5,
        })
      ).toEqual({
        ok: false,
        message: `practiceDelay must be between ${PRACTICE_DELAY_MIN} and ${PRACTICE_DELAY_MAX}`,
      })
    })

    it('rejects out-of-range warningRatio', () => {
      expect(
        validatePracticeSettingsPayload({
          practiceDelay: 30,
          warningRatio: 1.1,
        })
      ).toEqual({
        ok: false,
        message: 'warningRatio must be between 0 and 1',
      })
      expect(
        validatePracticeSettingsPayload({
          practiceDelay: 30,
          warningRatio: -0.1,
        })
      ).toEqual({
        ok: false,
        message: 'warningRatio must be between 0 and 1',
      })
    })

    it('accepts valid payloads with rounded values', () => {
      expect(
        validatePracticeSettingsPayload({
          practiceDelay: 30.4,
          warningRatio: 0.66,
        })
      ).toEqual({
        ok: true,
        value: { practiceDelay: 30, warningRatio: 0.7 },
      })
    })
  })
})
