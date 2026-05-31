import * as reprStore from '../../lib/reprStore'
import * as stripeClient from '../../lib/stripeClient'
import { postPortalSessionHandler } from './portalSession'

const authEvent = () =>
  ({
    requestContext: {
      authorizer: { jwt: { claims: { sub: 'user-1' } } },
    },
  }) as any

describe('postPortalSessionHandler', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test'
    process.env.STRIPE_PRICE_ID = 'price_1'
    process.env.STRIPE_PORTAL_RETURN_URL = 'https://app.example/settings'
    jest.spyOn(stripeClient, 'isStripeConfigured').mockReturnValue(true)
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.restoreAllMocks()
  })

  it('returns 503 when Stripe is not configured', async () => {
    jest.spyOn(stripeClient, 'isStripeConfigured').mockReturnValue(false)
    const res = await postPortalSessionHandler(authEvent())
    expect(res.statusCode).toBe(503)
  })

  it('returns 400 when the user has no Stripe customer', async () => {
    jest.spyOn(reprStore, 'getUserConfig').mockResolvedValue({
      pk: 'USER#user-1',
      sk: 'CONFIG',
    } as Awaited<ReturnType<typeof reprStore.getUserConfig>>)
    const res = await postPortalSessionHandler(authEvent())
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).message).toMatch(/Subscribe first/)
  })

  it('returns a billing portal url', async () => {
    jest.spyOn(reprStore, 'getUserConfig').mockResolvedValue({
      pk: 'USER#user-1',
      sk: 'CONFIG',
      stripeCustomerId: 'cus_1',
    } as Awaited<ReturnType<typeof reprStore.getUserConfig>>)
    jest.spyOn(stripeClient, 'getStripeClient').mockReturnValue({
      billingPortal: {
        sessions: {
          create: jest.fn().mockResolvedValue({
            url: 'https://billing.stripe.com/portal',
          }),
        },
      },
    } as unknown as ReturnType<typeof stripeClient.getStripeClient>)

    const res = await postPortalSessionHandler(authEvent())
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({
      url: 'https://billing.stripe.com/portal',
    })
  })
})
