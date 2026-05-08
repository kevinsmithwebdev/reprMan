import { getUserId } from './auth'

describe('auth', () => {
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
})
