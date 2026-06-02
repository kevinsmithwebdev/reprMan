import * as reprStore from '../../lib/reprStore'
import * as stripeClient from '../../lib/stripeClient'
import { postCheckoutSessionHandler } from './checkoutSession'

const authEvent = (claims: Record<string, unknown> = { sub: 'user-1' }) =>
  ({
    requestContext: {
      authorizer: { jwt: { claims } },
    },
  }) as any

describe('postCheckoutSessionHandler', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test'
    process.env.STRIPE_PRICE_ID = 'price_1'
    process.env.STRIPE_CHECKOUT_SUCCESS_URL = 'https://app.example/success'
    process.env.STRIPE_CHECKOUT_CANCEL_URL = 'https://app.example/cancel'
    jest.spyOn(stripeClient, 'isStripeConfigured').mockReturnValue(true)
    jest.spyOn(reprStore, 'getUserConfig').mockResolvedValue({
      pk: 'USER#user-1',
      sk: 'CONFIG',
    } as Awaited<ReturnType<typeof reprStore.getUserConfig>>)
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.restoreAllMocks()
  })

  it('returns 503 when Stripe is not configured', async () => {
    jest.spyOn(stripeClient, 'isStripeConfigured').mockReturnValue(false)
    const res = await postCheckoutSessionHandler(authEvent())
    expect(res.statusCode).toBe(503)
  })

  it('creates a checkout session for an existing customer', async () => {
    jest.spyOn(reprStore, 'getUserConfig').mockResolvedValue({
      pk: 'USER#user-1',
      sk: 'CONFIG',
      stripeCustomerId: 'cus_existing',
    } as Awaited<ReturnType<typeof reprStore.getUserConfig>>)
    const createSession = jest.fn().mockResolvedValue({
      url: 'https://checkout.stripe.com/session',
    })
    jest.spyOn(stripeClient, 'getStripeClient').mockReturnValue({
      customers: { create: jest.fn() },
      checkout: { sessions: { create: createSession } },
    } as unknown as ReturnType<typeof stripeClient.getStripeClient>)

    const res = await postCheckoutSessionHandler(
      authEvent({ sub: 'user-1', email: 'user@example.com' })
    )
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({
      url: 'https://checkout.stripe.com/session',
    })
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_existing' })
    )
  })

  it('creates a Stripe customer when missing and returns checkout url', async () => {
    const customersCreate = jest.fn().mockResolvedValue({ id: 'cus_new' })
    const createSession = jest.fn().mockResolvedValue({
      url: 'https://checkout.stripe.com/new',
    })
    jest.spyOn(stripeClient, 'getStripeClient').mockReturnValue({
      customers: { create: customersCreate },
      checkout: { sessions: { create: createSession } },
    } as unknown as ReturnType<typeof stripeClient.getStripeClient>)
    const updateSpy = jest
      .spyOn(reprStore, 'updateUserBillingConfig')
      .mockResolvedValue({
        pk: 'USER#user-1',
        sk: 'CONFIG',
        stripeCustomerId: 'cus_new',
      } as Awaited<ReturnType<typeof reprStore.updateUserBillingConfig>>)

    const res = await postCheckoutSessionHandler(
      authEvent({ sub: 'user-1', email: 'user@example.com' })
    )
    expect(res.statusCode).toBe(200)
    expect(customersCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        metadata: { cognitoSub: 'user-1' },
      })
    )
    expect(updateSpy).toHaveBeenCalledWith('user-1', {
      stripeCustomerId: 'cus_new',
    })
  })

  it('returns 500 when Stripe omits session url', async () => {
    jest.spyOn(reprStore, 'getUserConfig').mockResolvedValue({
      pk: 'USER#user-1',
      sk: 'CONFIG',
      stripeCustomerId: 'cus_1',
    } as Awaited<ReturnType<typeof reprStore.getUserConfig>>)
    jest.spyOn(stripeClient, 'getStripeClient').mockReturnValue({
      customers: { create: jest.fn() },
      checkout: { sessions: { create: jest.fn().mockResolvedValue({}) } },
    } as unknown as ReturnType<typeof stripeClient.getStripeClient>)

    const res = await postCheckoutSessionHandler(authEvent())
    expect(res.statusCode).toBe(500)
  })
})
