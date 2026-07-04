import { Amplify } from 'aws-amplify'
import { getClientConfig } from '@reprman/client-config'

/**
 * When env vars are unset, the app runs without Cognito (unchanged behavior).
 * Call `setClientConfig()` from the app entry before this function.
 */
export function isCognitoConfigured(): boolean {
  const config = getClientConfig()
  return Boolean(config.cognitoUserPoolId && config.cognitoUserPoolClientId)
}

export function requireHomeSignInWall(): boolean {
  return getClientConfig().requireHomeSignIn
}

export function allowAnonymousHome(): boolean {
  return getClientConfig().allowAnonymousHome
}

export function homeAuthGateActive(): boolean {
  return (
    isCognitoConfigured() || requireHomeSignInWall() || !allowAnonymousHome()
  )
}

export function configureAmplify(): void {
  const config = getClientConfig()
  const {
    cognitoUserPoolId: userPoolId,
    cognitoUserPoolClientId: userPoolClientId,
    cognitoIdentityPoolId: identityPoolId,
    reprsApiBaseUrl,
  } = config

  if (!userPoolId || !userPoolClientId) {
    console.error(
      '[env] Missing Cognito configuration: cognito user pool id and/or client id'
    )
  }

  if (!reprsApiBaseUrl) {
    console.error(
      '[env] Missing reprs API base URL: repr API disabled, local fallback active'
    )
  }

  if (!isCognitoConfigured()) {
    return
  }

  if (identityPoolId) {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          identityPoolId,
          loginWith: { email: true },
        },
      },
    })
    return
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: { email: true },
      },
    },
  })
}
