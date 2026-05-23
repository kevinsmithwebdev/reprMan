import * as reprStore from '../lib/reprStore'
import { postTermsAcceptanceHandler } from './termsAcceptance'

const authEvent = (body?: object) =>
  ({
    body: body ? JSON.stringify(body) : undefined,
    requestContext: {
      authorizer: { jwt: { claims: { sub: 'user-1' } } },
    },
  } as any)

describe('postTermsAcceptanceHandler', () => {
  let recordSpy: jest.SpiedFunction<typeof reprStore.recordTermsAcceptance>

  beforeEach(() => {
    recordSpy = jest
      .spyOn(reprStore, 'recordTermsAcceptance')
      .mockResolvedValue({
        pk: 'USER#user-1',
        sk: 'CONFIG',
        termsAcceptedAt: '2026-01-01T00:00:00.000Z',
        termsVersion: '1',
      })
  })

  afterEach(() => {
    recordSpy.mockRestore()
  })

  it('records acceptance for the current terms version', async () => {
    const res = await postTermsAcceptanceHandler(
      authEvent({ termsVersion: '1' })
    )
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({
      termsAcceptedAt: '2026-01-01T00:00:00.000Z',
      termsVersion: '1',
      currentTermsVersion: '1',
    })
    expect(recordSpy).toHaveBeenCalledWith('user-1', '1')
  })

  it('returns 400 for an invalid terms version', async () => {
    const res = await postTermsAcceptanceHandler(
      authEvent({ termsVersion: '0' })
    )
    expect(res.statusCode).toBe(400)
    expect(recordSpy).not.toHaveBeenCalled()
  })

  it('returns 401 when user is not authenticated', async () => {
    const res = await postTermsAcceptanceHandler({
      body: JSON.stringify({ termsVersion: '1' }),
      requestContext: {},
    } as any)
    expect(res.statusCode).toBe(401)
    expect(recordSpy).not.toHaveBeenCalled()
  })
})
