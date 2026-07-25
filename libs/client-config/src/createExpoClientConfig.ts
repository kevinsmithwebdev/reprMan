import { ClientConfig } from './types'

const trimEnv = (value: string | undefined): string => (value ?? '').trim()

const readEnv = (
  env: Record<string, string | undefined>,
  key: string
): string => trimEnv(env[key])

const readBoolEnv = (
  env: Record<string, string | undefined>,
  key: string
): boolean => readEnv(env, key) === 'true'

const readEnvWithFallback = (
  env: Record<string, string | undefined>,
  expoKey: string,
  nextKey: string
): string => readEnv(env, expoKey) || readEnv(env, nextKey)

const fromExplicitEnv = (
  env: Record<string, string | undefined>
): ClientConfig => ({
  cognitoUserPoolId: readEnvWithFallback(
    env,
    'EXPO_PUBLIC_COGNITO_USER_POOL_ID',
    'NEXT_PUBLIC_COGNITO_USER_POOL_ID'
  ),
  cognitoUserPoolClientId: readEnvWithFallback(
    env,
    'EXPO_PUBLIC_COGNITO_USER_POOL_CLIENT_ID',
    'NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID'
  ),
  cognitoIdentityPoolId: readEnvWithFallback(
    env,
    'EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID',
    'NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID'
  ),
  reprsApiBaseUrl: readEnvWithFallback(
    env,
    'EXPO_PUBLIC_REPRS_API_BASE_URL',
    'NEXT_PUBLIC_REPRS_API_BASE_URL'
  ),
  requireHomeSignIn:
    readBoolEnv(env, 'EXPO_PUBLIC_REQUIRE_HOME_SIGN_IN') ||
    readBoolEnv(env, 'NEXT_PUBLIC_REQUIRE_HOME_SIGN_IN'),
  allowAnonymousHome:
    readBoolEnv(env, 'EXPO_PUBLIC_ALLOW_ANONYMOUS_HOME') ||
    readBoolEnv(env, 'NEXT_PUBLIC_ALLOW_ANONYMOUS_HOME'),
})

/**
 * Build config from Expo `process.env` or an explicit env map (tests).
 *
 * Prefers `EXPO_PUBLIC_*`, falling back to `NEXT_PUBLIC_*` so a monorepo root
 * `.env` can drive both web and mobile during local development.
 */
export const createExpoClientConfig = (
  env?: Record<string, string | undefined>
): ClientConfig => {
  if (env) {
    return fromExplicitEnv(env)
  }

  return {
    cognitoUserPoolId:
      trimEnv(process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID) ||
      trimEnv(process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID),
    cognitoUserPoolClientId:
      trimEnv(process.env.EXPO_PUBLIC_COGNITO_USER_POOL_CLIENT_ID) ||
      trimEnv(process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID),
    cognitoIdentityPoolId:
      trimEnv(process.env.EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID) ||
      trimEnv(process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID),
    reprsApiBaseUrl:
      trimEnv(process.env.EXPO_PUBLIC_REPRS_API_BASE_URL) ||
      trimEnv(process.env.NEXT_PUBLIC_REPRS_API_BASE_URL),
    requireHomeSignIn:
      trimEnv(process.env.EXPO_PUBLIC_REQUIRE_HOME_SIGN_IN) === 'true' ||
      trimEnv(process.env.NEXT_PUBLIC_REQUIRE_HOME_SIGN_IN) === 'true',
    allowAnonymousHome:
      trimEnv(process.env.EXPO_PUBLIC_ALLOW_ANONYMOUS_HOME) === 'true' ||
      trimEnv(process.env.NEXT_PUBLIC_ALLOW_ANONYMOUS_HOME) === 'true',
  }
}
