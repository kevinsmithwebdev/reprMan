import { createExpoClientConfig } from './createExpoClientConfig'

describe('createExpoClientConfig', () => {
  it('maps EXPO_PUBLIC_* env vars to ClientConfig', () => {
    expect(
      createExpoClientConfig({
        EXPO_PUBLIC_COGNITO_USER_POOL_ID: ' pool ',
        EXPO_PUBLIC_COGNITO_USER_POOL_CLIENT_ID: 'client',
        EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID: 'identity',
        EXPO_PUBLIC_REPRS_API_BASE_URL: 'https://api.example.com',
        EXPO_PUBLIC_REQUIRE_HOME_SIGN_IN: 'true',
        EXPO_PUBLIC_ALLOW_ANONYMOUS_HOME: 'false',
      })
    ).toEqual({
      cognitoUserPoolId: 'pool',
      cognitoUserPoolClientId: 'client',
      cognitoIdentityPoolId: 'identity',
      reprsApiBaseUrl: 'https://api.example.com',
      requireHomeSignIn: true,
      allowAnonymousHome: false,
    })
  })

  it('falls back to NEXT_PUBLIC_* when EXPO_PUBLIC_* is unset', () => {
    expect(
      createExpoClientConfig({
        NEXT_PUBLIC_COGNITO_USER_POOL_ID: 'pool',
        NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID: 'client',
        NEXT_PUBLIC_REPRS_API_BASE_URL: 'https://api.example.com',
      })
    ).toEqual({
      cognitoUserPoolId: 'pool',
      cognitoUserPoolClientId: 'client',
      cognitoIdentityPoolId: '',
      reprsApiBaseUrl: 'https://api.example.com',
      requireHomeSignIn: false,
      allowAnonymousHome: false,
    })
  })
})
