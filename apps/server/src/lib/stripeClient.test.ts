import {
  getStripeClient,
  getStripePriceId,
  getStripeSecretKey,
  getStripeWebhookSecret,
  isStripeConfigured,
  subscriptionPeriodEndMs,
} from './stripeClient'

describe('stripeClient', () => {
  const originalKey = process.env.STRIPE_SECRET_KEY
  const originalPrice = process.env.STRIPE_PRICE_ID
  const originalWebhook = process.env.STRIPE_WEBHOOK_SECRET

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.STRIPE_SECRET_KEY
    } else {
      process.env.STRIPE_SECRET_KEY = originalKey
    }
    if (originalPrice === undefined) {
      delete process.env.STRIPE_PRICE_ID
    } else {
      process.env.STRIPE_PRICE_ID = originalPrice
    }
    if (originalWebhook === undefined) {
      delete process.env.STRIPE_WEBHOOK_SECRET
    } else {
      process.env.STRIPE_WEBHOOK_SECRET = originalWebhook
    }
    jest.resetModules()
  })

  it('reads trimmed env helpers', () => {
    process.env.STRIPE_SECRET_KEY = '  sk_test_abc  '
    process.env.STRIPE_PRICE_ID = 'price_1'
    process.env.STRIPE_WEBHOOK_SECRET = ' whsec_1 '
    jest.isolateModules(() => {
      const mod = require('./stripeClient') as typeof import('./stripeClient')
      expect(mod.getStripeSecretKey()).toBe('sk_test_abc')
      expect(mod.getStripePriceId()).toBe('price_1')
      expect(mod.getStripeWebhookSecret()).toBe('whsec_1')
      expect(mod.isStripeConfigured()).toBe(true)
    })
  })

  it('returns undefined for blank env values', () => {
    process.env.STRIPE_SECRET_KEY = '   '
    process.env.STRIPE_PRICE_ID = ''
    expect(getStripeSecretKey()).toBeUndefined()
    expect(getStripePriceId()).toBeUndefined()
    expect(isStripeConfigured()).toBe(false)
  })

  it('reuses a single Stripe client instance', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_singleton'
    jest.isolateModules(() => {
      const mod = require('./stripeClient') as typeof import('./stripeClient')
      const first = mod.getStripeClient()
      const second = mod.getStripeClient()
      expect(first).toBe(second)
      expect(first).toHaveProperty('subscriptions')
    })
  })

  it('throws when secret key is missing', () => {
    delete process.env.STRIPE_SECRET_KEY
    expect(() => getStripeClient()).toThrow(/STRIPE_SECRET_KEY/)
  })

  it('maps subscription period end to milliseconds', () => {
    expect(
      subscriptionPeriodEndMs({
        current_period_end: 1_700_000_000,
      } as import('stripe').Stripe.Subscription)
    ).toBe(1_700_000_000_000)
    expect(
      subscriptionPeriodEndMs({} as import('stripe').Stripe.Subscription)
    ).toBeUndefined()
  })
})
