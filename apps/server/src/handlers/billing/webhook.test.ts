import type Stripe from 'stripe'
import * as reprStore from '../../lib/reprStore'
import * as stripeClient from '../../lib/stripeClient'
import { postStripeWebhookHandler } from './webhook'

const webhookEvent = (
  overrides: {
    type?: string
    object?: Record<string, unknown>
    headers?: Record<string, string>
    body?: string
    isBase64Encoded?: boolean
  } = {}
) =>
  ({
    headers: {
      'stripe-signature': 'sig_test',
      ...overrides.headers,
    },
    body: overrides.body ?? '{}',
    isBase64Encoded: overrides.isBase64Encoded ?? false,
    ...overrides,
  } as any)

describe('postStripeWebhookHandler', () => {
  let constructEvent: jest.Mock
  let retrieveSubscription: jest.Mock

  beforeEach(() => {
    jest
      .spyOn(stripeClient, 'getStripeWebhookSecret')
      .mockReturnValue('whsec_test')
    retrieveSubscription = jest.fn()
    constructEvent = jest.fn()
    jest.spyOn(stripeClient, 'getStripeClient').mockReturnValue({
      webhooks: { constructEvent },
      subscriptions: { retrieve: retrieveSubscription },
    } as unknown as ReturnType<typeof stripeClient.getStripeClient>)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns 503 when webhook secret is not configured', async () => {
    jest
      .spyOn(stripeClient, 'getStripeWebhookSecret')
      .mockReturnValue(undefined)
    const res = await postStripeWebhookHandler(webhookEvent())
    expect(res.statusCode).toBe(503)
  })

  it('returns 400 when stripe-signature header is missing', async () => {
    const res = await postStripeWebhookHandler(webhookEvent({ headers: {} }))
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).message).toMatch(/signature/i)
  })

  it('returns 400 when signature verification fails', async () => {
    constructEvent.mockImplementation(() => {
      throw new Error('bad sig')
    })
    const res = await postStripeWebhookHandler(webhookEvent())
    expect(res.statusCode).toBe(400)
  })

  it('handles checkout.session.completed', async () => {
    const updateSpy = jest
      .spyOn(reprStore, 'updateUserBillingConfig')
      .mockResolvedValue({
        pk: 'USER#user-1',
        sk: 'CONFIG',
      } as Awaited<ReturnType<typeof reprStore.updateUserBillingConfig>>)
    retrieveSubscription.mockResolvedValue({
      id: 'sub_1',
      customer: 'cus_1',
      status: 'active',
      current_period_end: 1_700_000_000,
    })
    constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          client_reference_id: 'user-1',
          customer: 'cus_1',
          subscription: 'sub_1',
        },
      },
    })
    const res = await postStripeWebhookHandler(webhookEvent())
    expect(res.statusCode).toBe(200)
    expect(updateSpy).toHaveBeenCalled()
    updateSpy.mockRestore()
  })

  it('handles customer.subscription.updated via customer lookup', async () => {
    const updateSpy = jest
      .spyOn(reprStore, 'updateUserBillingConfig')
      .mockResolvedValue({
        pk: 'USER#user-1',
        sk: 'CONFIG',
      } as Awaited<ReturnType<typeof reprStore.updateUserBillingConfig>>)
    jest
      .spyOn(reprStore, 'findUserIdByStripeCustomerId')
      .mockResolvedValue('user-1')
    constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_1',
          customer: 'cus_1',
          status: 'active',
          current_period_end: 1_700_000_000,
          metadata: {},
        },
      },
    })
    const res = await postStripeWebhookHandler(webhookEvent())
    expect(res.statusCode).toBe(200)
    expect(updateSpy).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        stripeSubscriptionId: 'sub_1',
        stripeSubscriptionStatus: 'active',
      })
    )
    updateSpy.mockRestore()
  })

  it('clears subscription on customer.subscription.deleted', async () => {
    const updateSpy = jest
      .spyOn(reprStore, 'updateUserBillingConfig')
      .mockResolvedValue({
        pk: 'USER#user-1',
        sk: 'CONFIG',
      } as Awaited<ReturnType<typeof reprStore.updateUserBillingConfig>>)
    constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_1',
          customer: 'cus_1',
          status: 'canceled',
          metadata: { cognitoSub: 'user-1' },
        },
      },
    })
    const res = await postStripeWebhookHandler(webhookEvent())
    expect(res.statusCode).toBe(200)
    expect(updateSpy).toHaveBeenCalledWith('user-1', {
      stripeSubscriptionStatus: 'canceled',
      stripeCurrentPeriodEndMs: null,
    })
    updateSpy.mockRestore()
  })

  it('returns 500 when persistence fails', async () => {
    jest
      .spyOn(reprStore, 'updateUserBillingConfig')
      .mockRejectedValue(new Error('db'))
    constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_1',
          customer: 'cus_1',
          status: 'canceled',
          metadata: { cognitoSub: 'user-1' },
        },
      },
    })
    const res = await postStripeWebhookHandler(webhookEvent())
    expect(res.statusCode).toBe(500)
  })

  it('ignores unknown event types', async () => {
    constructEvent.mockReturnValue({
      type: 'invoice.paid',
      data: { object: {} },
    } as Stripe.Event)
    const res = await postStripeWebhookHandler(webhookEvent())
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({ received: true })
  })
})
