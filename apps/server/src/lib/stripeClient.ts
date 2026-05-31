import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export const getStripeSecretKey = (): string | undefined =>
  process.env.STRIPE_SECRET_KEY?.trim() || undefined

export const getStripeWebhookSecret = (): string | undefined =>
  process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined

export const getStripePriceId = (): string | undefined =>
  process.env.STRIPE_PRICE_ID?.trim() || undefined

export const isStripeConfigured = (): boolean =>
  Boolean(getStripeSecretKey() && getStripePriceId())

export const getStripeClient = (): Stripe => {
  const key = getStripeSecretKey()
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key)
  }
  return stripeClient
}

export const subscriptionPeriodEndMs = (
  subscription: Stripe.Subscription
): number | undefined => {
  const end = subscription.current_period_end
  return typeof end === 'number' ? end * 1000 : undefined
}
