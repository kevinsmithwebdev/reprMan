import { getUserId } from '../../lib/auth'
import { mapHandlerError } from '../../lib/handlerErrors'
import { jsonResponse } from '../../lib/http'
import { getUserConfig } from '../../lib/reprStore'
import { getStripeClient, isStripeConfigured } from '../../lib/stripeClient'

const portalReturnUrl = (): string => {
  const url = process.env.STRIPE_PORTAL_RETURN_URL?.trim()
  if (!url) {
    throw new Error('STRIPE_PORTAL_RETURN_URL is not configured')
  }
  return url
}

export const postPortalSessionHandler = async (event: any): Promise<any> => {
  try {
    if (!isStripeConfigured()) {
      return jsonResponse(503, {
        message: 'Billing is not configured on this server.',
      })
    }

    const userId = getUserId(event)
    const config = await getUserConfig(userId)
    if (!config.stripeCustomerId) {
      return jsonResponse(400, {
        message: 'No billing account exists yet. Subscribe first.',
      })
    }

    const stripe = getStripeClient()
    const session = await stripe.billingPortal.sessions.create({
      customer: config.stripeCustomerId,
      return_url: portalReturnUrl(),
    })

    return jsonResponse(200, { url: session.url })
  } catch (error: unknown) {
    return mapHandlerError(error, {
      defaultStatus: 400,
      defaultMessage: 'Bad request',
    })
  }
}
