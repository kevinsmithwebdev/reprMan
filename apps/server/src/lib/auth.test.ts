import { getUserId, UnauthorizedError } from './auth'

describe('auth', () => {
  it('names UnauthorizedError correctly', () => {
    expect(new UnauthorizedError('nope').name).toBe('UnauthorizedError')
  })

  it('returns user id from jwt claims', () => {
    const userId = getUserId({
      requestContext: {
        authorizer: {
          jwt: {
            claims: { sub: 'user-1' },
          },
        },
      },
    } as any)

    expect(userId).toBe('user-1')
  })

  it('throws when user claim is missing', () => {
    expect(() =>
      getUserId({
        requestContext: {
          authorizer: {
            jwt: {
              claims: {},
            },
          },
        },
      } as any)
    ).toThrow('Unauthorized')
  })

  it('throws when user claim is not a string', () => {
    expect(() =>
      getUserId({
        requestContext: {
          authorizer: {
            jwt: {
              claims: { sub: 123 },
            },
          },
        },
      } as any)
    ).toThrow('Unauthorized')
  })
})
