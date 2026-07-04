import { API_ROUTES, apiGatewayPathToRegex, matchesApiPath } from './apiRoutes'

describe('apiRoutes', () => {
  it('matches concrete paths from templates', () => {
    expect(matchesApiPath('/reprs', '/reprs')).toBe(true)
    expect(matchesApiPath('/reprs/r1', '/reprs/{id}')).toBe(true)
    expect(matchesApiPath('/reprs/r1/practice', '/reprs/{id}/practice')).toBe(
      true
    )
    expect(matchesApiPath('/reprs/r1/practice', '/reprs/{id}')).toBe(false)
  })

  it('defines the same routes used by API Gateway', () => {
    expect(API_ROUTES.map((route) => route.apiGatewayPath)).toEqual([
      '/user/config',
      '/user/settings',
      '/user/terms-acceptance',
      '/reprs',
      '/reprs/{id}',
      '/reprs/{id}/practice',
      '/billing/checkout-session',
      '/billing/portal-session',
      '/billing/stripe-webhook',
    ])
  })

  it('builds regex patterns for path templates', () => {
    expect(apiGatewayPathToRegex('/reprs/{id}').test('/reprs/abc')).toBe(true)
    expect(apiGatewayPathToRegex('/reprs/{id}').test('/reprs/a/b')).toBe(false)
  })
})
