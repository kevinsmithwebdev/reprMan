import { getUserId } from '../../lib/auth'
import { mapHandlerError } from '../../lib/handlerErrors'
import { jsonResponse } from '../../lib/http'
import { getUserConfig, updateUserBillingConfig } from '../../lib/reprStore'
import {
  getStripeClient,
  getStripePriceId,
  isStripeConfigured,
  getStripeCheckoutCancelUrl,
  getStripeCheckoutSuccessUrl,
} from '../../lib/stripeClient'

const checkoutUrls = () => {
  const success = getStripeCheckoutSuccessUrl()
  const cancel = getStripeCheckoutCancelUrl()
  if (!success || !cancel) {
    throw new Error('Stripe checkout redirect URLs are not configured')
  }
  return { success, cancel }
}

const getUserEmail = (event: {
  requestContext?: {
    authorizer?: { jwt?: { claims?: Record<string, unknown> } }
  }
}): string | undefined => {
  const email = event.requestContext?.authorizer?.jwt?.claims?.email
  return typeof email === 'string' ? email : undefined
}

export const postCheckoutSessionHandler = async (event: any): Promise<any> => {
  try {
    if (!isStripeConfigured()) {
      return jsonResponse(503, {
        message: 'Billing is not configured on this server.',
      })
    }

    const userId = getUserId(event)
    const config = await getUserConfig(userId)
    const stripe = getStripeClient()
    const priceId = getStripePriceId()
    if (!priceId) {
      return jsonResponse(503, { message: 'Stripe price is not configured.' })
    }

    const { success, cancel } = checkoutUrls()
    const email = getUserEmail(event)

    let customerId = config.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { cognitoSub: userId },
      })
      customerId = customer.id
      await updateUserBillingConfig(userId, { stripeCustomerId: customerId })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success,
      cancel_url: cancel,
      client_reference_id: userId,
      metadata: { cognitoSub: userId },
      subscription_data: {
        metadata: { cognitoSub: userId },
      },
    })

    if (!session.url) {
      return jsonResponse(500, {
        message: 'Could not create checkout session.',
      })
    }

    return jsonResponse(200, { url: session.url })
  } catch (error: unknown) {
    return mapHandlerError(error, {
      defaultStatus: 400,
      defaultMessage: 'Bad request',
    })
  }
}
