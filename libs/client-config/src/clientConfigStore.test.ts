import { describe, expect, it, vi } from 'vitest'

describe('clientConfigStore', () => {
  it('persists config across dynamic imports after resetModules', async () => {
    vi.resetModules()
    const first = await import('./clientConfigStore')
    first.setClientConfig({
      cognitoUserPoolId: 'pool',
      cognitoUserPoolClientId: 'client',
      cognitoIdentityPoolId: '',
      reprsApiBaseUrl: 'https://api.example.com',
      requireHomeSignIn: false,
      allowAnonymousHome: false,
    })

    const second = await import('./clientConfigStore')
    expect(second.getClientConfig()).toEqual({
      cognitoUserPoolId: 'pool',
      cognitoUserPoolClientId: 'client',
      cognitoIdentityPoolId: '',
      reprsApiBaseUrl: 'https://api.example.com',
      requireHomeSignIn: false,
      allowAnonymousHome: false,
    })
  })
})
