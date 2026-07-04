import Stripe from 'stripe'
import {
  getStripeCheckoutCancelUrl,
  getStripeCheckoutSuccessUrl,
  getStripePortalReturnUrl,
  getStripePriceId as readStripePriceId,
  getStripeSecretKey as readStripeSecretKey,
  getStripeWebhookSecret as readStripeWebhookSecret,
} from './config'

let stripeClient: Stripe | null = null

export const getStripeSecretKey = readStripeSecretKey

export const getStripeWebhookSecret = readStripeWebhookSecret

export const getStripePriceId = readStripePriceId

export const isStripeConfigured = (): boolean =>
  Boolean(getStripeSecretKey() && getStripePriceId())

export const getStripeClient = (): Stripe => {
  const key = getStripeSecretKey()
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  stripeClient ??= new Stripe(key)
  return stripeClient
}

export const subscriptionPeriodEndMs = (
  subscription: Stripe.Subscription
): number | undefined => {
  const end = subscription.current_period_end
  return typeof end === 'number' ? end * 1000 : undefined
}

export {
  getStripeCheckoutSuccessUrl,
  getStripeCheckoutCancelUrl,
  getStripePortalReturnUrl,
}
