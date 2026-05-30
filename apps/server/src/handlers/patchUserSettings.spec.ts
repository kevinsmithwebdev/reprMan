import * as reprStore from '../lib/reprStore'
import { patchUserSettingsHandler } from './patchUserSettings'

const authEvent = (body?: string) =>
  ({
    requestContext: {
      authorizer: { jwt: { claims: { sub: 'user-1' } } },
    },
    body,
  } as any)

describe('patchUserSettingsHandler', () => {
  let updateSpy: jest.SpiedFunction<typeof reprStore.updateUserPracticeSettings>
  let getUserConfigSpy: jest.SpiedFunction<typeof reprStore.getUserConfig>

  beforeEach(() => {
    updateSpy = jest
      .spyOn(reprStore, 'updateUserPracticeSettings')
      .mockResolvedValue({
        pk: 'USER#user-1',
        sk: 'CONFIG',
        practiceDelay: 14,
        warningRatio: 0.7,
      })
    getUserConfigSpy = jest
      .spyOn(reprStore, 'getUserConfig')
      .mockResolvedValue({
        pk: 'USER#user-1',
        sk: 'CONFIG',
        practiceDelay: 14,
        warningRatio: 0.7,
      })
  })

  afterEach(() => {
    updateSpy.mockRestore()
    getUserConfigSpy.mockRestore()
  })

  it('persists and returns practice settings', async () => {
    const res = await patchUserSettingsHandler(
      authEvent(JSON.stringify({ practiceDelay: 14, warningRatio: 0.7 }))
    )
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({
      practiceDelay: 14,
      warningRatio: 0.7,
    })
    expect(updateSpy).toHaveBeenCalledWith('user-1', {
      practiceDelay: 14,
      warningRatio: 0.7,
    })
  })

  it('returns 400 for invalid practiceDelay', async () => {
    const res = await patchUserSettingsHandler(
      authEvent(JSON.stringify({ practiceDelay: 500, warningRatio: 0.5 }))
    )
    expect(res.statusCode).toBe(400)
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('returns 401 when user is not authenticated', async () => {
    const res = await patchUserSettingsHandler({
      requestContext: {},
      body: JSON.stringify({ practiceDelay: 7, warningRatio: 0.5 }),
    } as any)
    expect(res.statusCode).toBe(401)
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await patchUserSettingsHandler(authEvent('{'))
    expect(res.statusCode).toBe(400)
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('accepts an empty body as an empty object', async () => {
    const res = await patchUserSettingsHandler(authEvent())
    expect(res.statusCode).toBe(400)
    expect(updateSpy).not.toHaveBeenCalled()
  })
})
