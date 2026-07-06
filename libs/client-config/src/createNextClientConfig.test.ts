import { createNextClientConfig } from './createNextClientConfig'

describe('createNextClientConfig', () => {
  it('maps NEXT_PUBLIC_* env vars to ClientConfig', () => {
    expect(
      createNextClientConfig({
        NEXT_PUBLIC_COGNITO_USER_POOL_ID: ' pool ',
        NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID: 'client',
        NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID: 'identity',
        NEXT_PUBLIC_REPRS_API_BASE_URL: 'https://api.example.com',
        NEXT_PUBLIC_REQUIRE_HOME_SIGN_IN: 'true',
        NEXT_PUBLIC_ALLOW_ANONYMOUS_HOME: 'false',
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

  it('falls back to VITE_* when NEXT_PUBLIC_* is unset', () => {
    expect(
      createNextClientConfig({
        VITE_COGNITO_USER_POOL_ID: 'pool',
        VITE_COGNITO_USER_POOL_CLIENT_ID: 'client',
        VITE_REPRS_API_BASE_URL: 'https://api.example.com',
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

  it('reads from process.env when no explicit env map is passed', () => {
    const env = process.env
    process.env = {
      ...env,
      NEXT_PUBLIC_COGNITO_USER_POOL_ID: ' pool ',
      NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID: 'client',
      NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID: 'identity',
      NEXT_PUBLIC_REPRS_API_BASE_URL: 'https://api.example.com',
      NEXT_PUBLIC_REQUIRE_HOME_SIGN_IN: 'true',
      NEXT_PUBLIC_ALLOW_ANONYMOUS_HOME: 'true',
    }

    try {
      expect(createNextClientConfig()).toEqual({
        cognitoUserPoolId: 'pool',
        cognitoUserPoolClientId: 'client',
        cognitoIdentityPoolId: 'identity',
        reprsApiBaseUrl: 'https://api.example.com',
        requireHomeSignIn: true,
        allowAnonymousHome: true,
      })
    } finally {
      process.env = env
    }
  })
})
