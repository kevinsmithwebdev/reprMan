import {
  COPYRIGHT_YEAR,
  DEFAULT_DAYS_WARNING,
  DEFAULT_DAYS_WARNING_MAX,
  DEFAULT_DAYS_WARNING_MIN,
  DEFAULT_WARNING_RATIO,
  FILE_LINE_DELIMITER,
  MAX_PRACTICED_DATES,
  MY_EMAIL,
  TERMS_VERSION,
} from './index'
import {
  DEFAULT_PRACTICE_DELAY,
  DEFAULT_WARNING_RATIO as QUOTA_WARNING_RATIO,
  PRACTICE_DELAY_MAX,
  PRACTICE_DELAY_MIN,
} from '@reprman/shared/quota'
import { MAX_PRACTICED_DATES as RULES_MAX_PRACTICED_DATES } from '@reprman/shared/repr-rules'

describe('constants', () => {
  it('re-exports quota defaults under legacy names', () => {
    expect(DEFAULT_DAYS_WARNING).toBe(DEFAULT_PRACTICE_DELAY)
    expect(DEFAULT_DAYS_WARNING_MIN).toBe(PRACTICE_DELAY_MIN)
    expect(DEFAULT_DAYS_WARNING_MAX).toBe(PRACTICE_DELAY_MAX)
    expect(DEFAULT_WARNING_RATIO).toBe(QUOTA_WARNING_RATIO)
  })

  it('re-exports repr-rules constants', () => {
    expect(MAX_PRACTICED_DATES).toBe(RULES_MAX_PRACTICED_DATES)
  })

  it('exports app literals', () => {
    expect(FILE_LINE_DELIMITER).toBe('*')
    expect(MY_EMAIL).toBe('kevinsmithwebdev@gmail.com')
    expect(COPYRIGHT_YEAR).toBe('2022')
    expect(TERMS_VERSION).toBe('1')
  })
})
