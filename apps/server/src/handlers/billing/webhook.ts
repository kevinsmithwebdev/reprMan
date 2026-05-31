import type Stripe from 'stripe'
import { jsonResponse } from '../../lib/http'
import {
  updateUserBillingConfig,
  findUserIdByStripeCustomerId,
} from '../../lib/reprStore'
import {
  getStripeClient,
  getStripeWebhookSecret,
  subscriptionPeriodEndMs,
} from '../../lib/stripeClient'

const readHeader = (
  headers: Record<string, string | undefined> | undefined,
  name: string
): string | undefined => {
  if (!headers) {
    return undefined
  }
  const lower = name.toLowerCase()
  return (
    headers[lower] ??
    headers[name] ??
    Object.entries(headers).find(([key]) => key.toLowerCase() === lower)?.[1]
  )
}

const resolveUserIdFromSubscription = (
  subscription: Stripe.Subscription
): string | undefined => {
  const fromMeta = subscription.metadata?.cognitoSub
  if (typeof fromMeta === 'string' && fromMeta) {
    return fromMeta
  }
  return undefined
}

const resolveUserIdFromSession = (
  session: Stripe.Checkout.Session
): string | undefined => {
  if (typeof session.client_reference_id === 'string') {
    return session.client_reference_id
  }
  const fromMeta = session.metadata?.cognitoSub
  if (typeof fromMeta === 'string' && fromMeta) {
    return fromMeta
  }
  return undefined
}

const applySubscriptionToUser = async (
  userId: string,
  subscription: Stripe.Subscription,
  customerId?: string
) => {
  await updateUserBillingConfig(userId, {
    stripeCustomerId: customerId ?? (subscription.customer as string),
    stripeSubscriptionId: subscription.id,
    stripeSubscriptionStatus: subscription.status,
    stripeCurrentPeriodEndMs: subscriptionPeriodEndMs(subscription) ?? null,
  })
}

const clearSubscriptionForUser = async (userId: string) => {
  await updateUserBillingConfig(userId, {
    stripeSubscriptionStatus: 'canceled',
    stripeCurrentPeriodEndMs: null,
  })
}

export const postStripeWebhookHandler = async (event: any): Promise<any> => {
  const webhookSecret = getStripeWebhookSecret()
  if (!webhookSecret) {
    return jsonResponse(503, { message: 'Webhook secret not configured.' })
  }

  const signature = readHeader(event.headers, 'stripe-signature')
  if (!signature) {
    return jsonResponse(400, { message: 'Missing Stripe signature.' })
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body ?? '', 'base64').toString('utf8')
    : event.body ?? ''

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = getStripeClient().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    )
  } catch {
    return jsonResponse(400, { message: 'Invalid Stripe signature.' })
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        const userId = resolveUserIdFromSession(session)
        if (userId && typeof session.customer === 'string') {
          await updateUserBillingConfig(userId, {
            stripeCustomerId: session.customer,
          })
        }
        if (userId && typeof session.subscription === 'string') {
          const subscription = await getStripeClient().subscriptions.retrieve(
            session.subscription
          )
          await applySubscriptionToUser(
            userId,
            subscription,
            typeof session.customer === 'string' ? session.customer : undefined
          )
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription
        let userId = resolveUserIdFromSubscription(subscription)
        if (!userId && typeof subscription.customer === 'string') {
          userId =
            (await findUserIdByStripeCustomerId(subscription.customer)) ??
            undefined
        }
        if (!userId) {
          break
        }
        if (stripeEvent.type === 'customer.subscription.deleted') {
          await clearSubscriptionForUser(userId)
        } else {
          await applySubscriptionToUser(userId, subscription)
        }
        break
      }
      default:
        break
    }
  } catch (error: unknown) {
    console.error('[stripe-webhook]', error)
    return jsonResponse(500, { message: 'Webhook handler failed.' })
  }

  return jsonResponse(200, { received: true })
}
