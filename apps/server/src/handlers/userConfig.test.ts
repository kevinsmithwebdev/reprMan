import * as reprStore from '../lib/reprStore'
import { getUserConfigHandler } from './userConfig'

const authEvent = {
  requestContext: {
    authorizer: { jwt: { claims: { sub: 'user-1' } } },
  },
} as any

describe('getUserConfigHandler', () => {
  let getUserConfigSpy: jest.SpiedFunction<typeof reprStore.getUserConfig>

  beforeEach(() => {
    getUserConfigSpy = jest
      .spyOn(reprStore, 'getUserConfig')
      .mockResolvedValue({
        pk: 'USER#user-1',
        sk: 'CONFIG',
        maxReprsAllowed: 7,
      })
  })

  afterEach(() => {
    getUserConfigSpy.mockRestore()
  })

  it('returns resolved maxReprsAllowed', async () => {
    const res = await getUserConfigHandler(authEvent)
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({
      maxReprsAllowed: 7,
      termsAcceptedAt: null,
      termsVersion: null,
      currentTermsVersion: '1',
      practiceDelay: 30,
      warningRatio: 0.5,
    })
    expect(getUserConfigSpy).toHaveBeenCalledWith('user-1')
  })

  it('returns stored terms metadata when present', async () => {
    getUserConfigSpy.mockResolvedValue({
      pk: 'USER#user-1',
      sk: 'CONFIG',
      maxReprsAllowed: null,
      termsAcceptedAt: '2026-01-01T00:00:00.000Z',
      termsVersion: '1',
      practiceDelay: 10,
      warningRatio: 0.8,
    })

    const res = await getUserConfigHandler(authEvent)
    expect(JSON.parse(res.body)).toEqual({
      maxReprsAllowed: null,
      termsAcceptedAt: '2026-01-01T00:00:00.000Z',
      termsVersion: '1',
      currentTermsVersion: '1',
      practiceDelay: 10,
      warningRatio: 0.8,
    })
  })

  it('returns 401 when user is not authenticated', async () => {
    const res = await getUserConfigHandler({ requestContext: {} } as any)
    expect(res.statusCode).toBe(401)
    expect(getUserConfigSpy).not.toHaveBeenCalled()
  })
})
