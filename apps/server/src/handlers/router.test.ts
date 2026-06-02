import * as patchUserSettings from './patchUserSettings'
import * as reprs from './reprs'
import * as termsAcceptance from './termsAcceptance'
import * as userConfig from './userConfig'
import { handler } from './router'

const routeEvent = (method: string, rawPath: string) =>
  ({
    requestContext: { http: { method } },
    rawPath,
  }) as any

describe('router handler', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('routes GET /user/config', async () => {
    const spy = jest
      .spyOn(userConfig, 'getUserConfigHandler')
      .mockResolvedValue({ statusCode: 200, body: '{}' })
    await handler(routeEvent('GET', '/user/config'))
    expect(spy).toHaveBeenCalled()
  })

  it('routes PATCH /user/settings', async () => {
    const spy = jest
      .spyOn(patchUserSettings, 'patchUserSettingsHandler')
      .mockResolvedValue({ statusCode: 200, body: '{}' })
    await handler(routeEvent('PATCH', '/user/settings'))
    expect(spy).toHaveBeenCalled()
  })

  it('routes POST /user/terms-acceptance', async () => {
    const spy = jest
      .spyOn(termsAcceptance, 'postTermsAcceptanceHandler')
      .mockResolvedValue({ statusCode: 200, body: '{}' })
    await handler(routeEvent('POST', '/user/terms-acceptance'))
    expect(spy).toHaveBeenCalled()
  })

  it('routes GET /reprs', async () => {
    const spy = jest
      .spyOn(reprs, 'getReprsHandler')
      .mockResolvedValue({ statusCode: 200, body: '{}' })
    await handler(routeEvent('GET', '/reprs'))
    expect(spy).toHaveBeenCalled()
  })

  it('routes PUT /reprs/{id}', async () => {
    const spy = jest
      .spyOn(reprs, 'putReprHandler')
      .mockResolvedValue({ statusCode: 200, body: '{}' })
    await handler(routeEvent('PUT', '/reprs/r1'))
    expect(spy).toHaveBeenCalled()
  })

  it('routes POST /reprs/{id}/practice', async () => {
    const spy = jest
      .spyOn(reprs, 'markReprPracticedHandler')
      .mockResolvedValue({ statusCode: 200, body: '{}' })
    await handler(routeEvent('POST', '/reprs/r1/practice'))
    expect(spy).toHaveBeenCalled()
  })

  it('routes DELETE /reprs/{id}', async () => {
    const spy = jest
      .spyOn(reprs, 'deleteReprHandler')
      .mockResolvedValue({ statusCode: 200, body: '{}' })
    await handler(routeEvent('DELETE', '/reprs/r1'))
    expect(spy).toHaveBeenCalled()
  })

  it('returns 404 for unknown routes', async () => {
    const res = await handler(routeEvent('GET', '/unknown'))
    expect(res.statusCode).toBe(404)
    expect(JSON.parse(res.body)).toEqual({ message: 'Not found' })
  })
})
