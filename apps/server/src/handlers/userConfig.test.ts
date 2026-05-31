import * as reprStore from '../lib/reprStore'
import { getUserConfigHandler } from './userConfig'

const authEvent = {
  requestContext: {
    authorizer: { jwt: { claims: { sub: 'user-1' } } },
  },
} as any

const trialEnd = Date.parse('2026-08-01T00:00:00.000Z')

describe('getUserConfigHandler', () => {
  let getUserConfigSpy: jest.SpiedFunction<typeof reprStore.getUserConfig>

  beforeEach(() => {
    getUserConfigSpy = jest.spyOn(reprStore, 'getUserConfig')
  })

  afterEach(() => {
    getUserConfigSpy.mockRestore()
  })

  it('returns subscription and mirrored maxReprsAllowed for trial user', async () => {
    getUserConfigSpy.mockResolvedValue({
      pk: 'USER#user-1',
      sk: 'CONFIG',
      trialEndsAtMs: trialEnd,
    })

    const res = await getUserConfigHandler(authEvent)
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.subscription.status).toBe('trial')
    expect(body.subscription.maxReprs).toBe(100)
    expect(body.maxReprsAllowed).toBe(100)
    expect(body.termsAcceptedAt).toBeNull()
    expect(body.practiceDelay).toBe(30)
    expect(getUserConfigSpy).toHaveBeenCalledWith('user-1')
  })

  it('returns stored terms metadata when present', async () => {
    getUserConfigSpy.mockResolvedValue({
      pk: 'USER#user-1',
      sk: 'CONFIG',
      stripeSubscriptionStatus: 'active',
      stripeCurrentPeriodEndMs: trialEnd,
      termsAcceptedAt: '2026-01-01T00:00:00.000Z',
      termsVersion: '1',
      practiceDelay: 10,
      warningRatio: 0.8,
    })

    const res = await getUserConfigHandler(authEvent)
    const body = JSON.parse(res.body)
    expect(body.subscription.status).toBe('paid')
    expect(body.termsAcceptedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(body.practiceDelay).toBe(10)
  })

  it('returns 401 when user is not authenticated', async () => {
    const res = await getUserConfigHandler({ requestContext: {} } as any)
    expect(res.statusCode).toBe(401)
    expect(getUserConfigSpy).not.toHaveBeenCalled()
  })
})
