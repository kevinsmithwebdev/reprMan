import { describe, expect, it } from 'vitest'
import { createWebClientConfig } from './createWebClientConfig'

describe('createWebClientConfig', () => {
  it('maps Vite env keys into ClientConfig', () => {
    const config = createWebClientConfig({
      VITE_COGNITO_USER_POOL_ID: ' pool ',
      VITE_COGNITO_USER_POOL_CLIENT_ID: ' client ',
      VITE_COGNITO_IDENTITY_POOL_ID: ' identity ',
      VITE_REPRS_API_BASE_URL: ' https://api.example.com ',
      VITE_REQUIRE_HOME_SIGN_IN: 'true',
      VITE_ALLOW_ANONYMOUS_HOME: 'false',
    })

    expect(config).toEqual({
      cognitoUserPoolId: 'pool',
      cognitoUserPoolClientId: 'client',
      cognitoIdentityPoolId: 'identity',
      reprsApiBaseUrl: 'https://api.example.com',
      requireHomeSignIn: true,
      allowAnonymousHome: false,
    })
  })
})
