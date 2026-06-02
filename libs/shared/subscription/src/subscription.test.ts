import {
  computeTrialEndsAtMs,
  daysUntilExpiration,
  isAtReprLimit,
  isStripeSubscriptionPaid,
  resolveSubscription,
  shouldShowPaidExpiryWarning,
  PAID_MAX_REPRS,
  TRIAL_MAX_REPRS,
  UNPAID_MAX_REPRS,
} from './index'

const baseConfig = {
  pk: 'USER#1',
  sk: 'CONFIG',
} as const

describe('resolveSubscription', () => {
  const now = Date.parse('2026-01-01T12:00:00.000Z')

  it('returns unlimited with null maxReprs', () => {
    expect(
      resolveSubscription({ ...baseConfig, subscriptionTier: 'unlimited' }, now)
    ).toEqual({
      status: 'unlimited',
      expiration: null,
      maxReprs: null,
    })
  })

  it('returns paid for active Stripe subscription', () => {
    expect(
      resolveSubscription(
        {
          ...baseConfig,
          stripeSubscriptionStatus: 'active',
          stripeCurrentPeriodEndMs: now + 86_400_000,
        },
        now
      )
    ).toEqual({
      status: 'paid',
      expiration: new Date(now + 86_400_000).toISOString(),
      maxReprs: PAID_MAX_REPRS,
    })
  })

  it('returns paid for complimentary period', () => {
    const until = now + 30 * 86_400_000
    expect(
      resolveSubscription(
        { ...baseConfig, complimentaryPaidUntilMs: until },
        now
      )
    ).toEqual({
      status: 'paid',
      expiration: new Date(until).toISOString(),
      maxReprs: PAID_MAX_REPRS,
    })
  })

  it('returns trial when trialEndsAtMs is in the future', () => {
    const trialEnd = now + 10 * 86_400_000
    expect(
      resolveSubscription({ ...baseConfig, trialEndsAtMs: trialEnd }, now)
    ).toEqual({
      status: 'trial',
      expiration: new Date(trialEnd).toISOString(),
      maxReprs: TRIAL_MAX_REPRS,
    })
  })

  it('returns unpaid when trial expired and not paid', () => {
    expect(
      resolveSubscription({ ...baseConfig, trialEndsAtMs: now - 1 }, now)
    ).toEqual({
      status: 'unpaid',
      expiration: null,
      maxReprs: UNPAID_MAX_REPRS,
    })
  })

  it('returns unpaid when no trialEndsAtMs (legacy user)', () => {
    expect(resolveSubscription({ ...baseConfig }, now)).toEqual({
      status: 'unpaid',
      expiration: null,
      maxReprs: UNPAID_MAX_REPRS,
    })
  })

  it('unlimited takes priority over paid stripe fields', () => {
    expect(
      resolveSubscription(
        {
          ...baseConfig,
          subscriptionTier: 'unlimited',
          stripeSubscriptionStatus: 'active',
        },
        now
      ).status
    ).toBe('unlimited')
  })
})

describe('isStripeSubscriptionPaid', () => {
  it('accepts active and trialing', () => {
    expect(isStripeSubscriptionPaid('active')).toBe(true)
    expect(isStripeSubscriptionPaid('trialing')).toBe(true)
    expect(isStripeSubscriptionPaid('canceled')).toBe(false)
  })
})

describe('daysUntilExpiration', () => {
  it('returns ceil days remaining', () => {
    const now = Date.parse('2026-01-01T00:00:00.000Z')
    const exp = '2026-01-03T12:00:00.000Z'
    expect(daysUntilExpiration(exp, now)).toBe(3)
  })

  it('returns 0 when past', () => {
    const now = Date.parse('2026-01-05T00:00:00.000Z')
    expect(daysUntilExpiration('2026-01-01T00:00:00.000Z', now)).toBe(0)
  })

  it('returns null for missing expiration', () => {
    expect(daysUntilExpiration(null)).toBeNull()
  })

  it('returns null for unparseable expiration', () => {
    expect(daysUntilExpiration('not-a-date')).toBeNull()
  })
})

describe('isAtReprLimit', () => {
  it('is false when maxReprs is null', () => {
    expect(
      isAtReprLimit(999, {
        status: 'unlimited',
        expiration: null,
        maxReprs: null,
      })
    ).toBe(false)
  })

  it('is true at cap', () => {
    expect(
      isAtReprLimit(25, {
        status: 'unpaid',
        expiration: null,
        maxReprs: 25,
      })
    ).toBe(true)
  })
})

describe('shouldShowPaidExpiryWarning', () => {
  const now = Date.parse('2026-01-01T00:00:00.000Z')

  it('shows within 10 days of paid expiration', () => {
    expect(
      shouldShowPaidExpiryWarning(
        {
          status: 'paid',
          expiration: '2026-01-08T00:00:00.000Z',
          maxReprs: 1000,
        },
        now
      )
    ).toBe(true)
  })

  it('hides when more than 10 days out', () => {
    expect(
      shouldShowPaidExpiryWarning(
        {
          status: 'paid',
          expiration: '2026-03-01T00:00:00.000Z',
          maxReprs: 1000,
        },
        now
      )
    ).toBe(false)
  })

  it('is false for non-paid subscriptions', () => {
    expect(
      shouldShowPaidExpiryWarning(
        {
          status: 'trial',
          expiration: '2026-01-08T00:00:00.000Z',
          maxReprs: 100,
        },
        now
      )
    ).toBe(false)
  })
})

describe('readEnvInt defaults', () => {
  const originalTrialDays = process.env.DEFAULT_TRIAL_DAYS

  afterEach(() => {
    if (originalTrialDays === undefined) {
      delete process.env.DEFAULT_TRIAL_DAYS
    } else {
      process.env.DEFAULT_TRIAL_DAYS = originalTrialDays
    }
    jest.resetModules()
  })

  it('falls back when env value is not a finite number', async () => {
    process.env.DEFAULT_TRIAL_DAYS = 'not-a-number'
    jest.resetModules()
    const { DEFAULT_TRIAL_DAYS } = await import('./index')
    expect(DEFAULT_TRIAL_DAYS).toBe(90)
  })
})

describe('computeTrialEndsAtMs', () => {
  it('adds default trial days', () => {
    const now = Date.parse('2026-01-01T00:00:00.000Z')
    const end = computeTrialEndsAtMs(now)
    expect(end - now).toBe(90 * 86_400_000)
  })
})
