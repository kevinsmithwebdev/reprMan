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
  nextKey: string,
  legacyKey: string
): string => readEnv(env, nextKey) || readEnv(env, legacyKey)

const fromExplicitEnv = (
  env: Record<string, string | undefined>
): ClientConfig => ({
  cognitoUserPoolId: readEnvWithFallback(
    env,
    'NEXT_PUBLIC_COGNITO_USER_POOL_ID',
    'VITE_COGNITO_USER_POOL_ID'
  ),
  cognitoUserPoolClientId: readEnvWithFallback(
    env,
    'NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID',
    'VITE_COGNITO_USER_POOL_CLIENT_ID'
  ),
  cognitoIdentityPoolId: readEnvWithFallback(
    env,
    'NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID',
    'VITE_COGNITO_IDENTITY_POOL_ID'
  ),
  reprsApiBaseUrl: readEnvWithFallback(
    env,
    'NEXT_PUBLIC_REPRS_API_BASE_URL',
    'VITE_REPRS_API_BASE_URL'
  ),
  requireHomeSignIn:
    readBoolEnv(env, 'NEXT_PUBLIC_REQUIRE_HOME_SIGN_IN') ||
    readBoolEnv(env, 'VITE_REQUIRE_HOME_SIGN_IN'),
  allowAnonymousHome:
    readBoolEnv(env, 'NEXT_PUBLIC_ALLOW_ANONYMOUS_HOME') ||
    readBoolEnv(env, 'VITE_ALLOW_ANONYMOUS_HOME'),
})

/**
 * Build config from Next.js `process.env` or an explicit env map (tests).
 *
 * Uses direct `process.env.NEXT_PUBLIC_*` reads (not dynamic keys) so Next.js
 * can inline public env vars into the client bundle.
 */
export const createNextClientConfig = (
  env?: Record<string, string | undefined>
): ClientConfig => {
  if (env) {
    return fromExplicitEnv(env)
  }

  return {
    cognitoUserPoolId:
      trimEnv(process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID) ||
      trimEnv(process.env.VITE_COGNITO_USER_POOL_ID),
    cognitoUserPoolClientId:
      trimEnv(process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID) ||
      trimEnv(process.env.VITE_COGNITO_USER_POOL_CLIENT_ID),
    cognitoIdentityPoolId:
      trimEnv(process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID) ||
      trimEnv(process.env.VITE_COGNITO_IDENTITY_POOL_ID),
    reprsApiBaseUrl:
      trimEnv(process.env.NEXT_PUBLIC_REPRS_API_BASE_URL) ||
      trimEnv(process.env.VITE_REPRS_API_BASE_URL),
    requireHomeSignIn:
      trimEnv(process.env.NEXT_PUBLIC_REQUIRE_HOME_SIGN_IN) === 'true' ||
      trimEnv(process.env.VITE_REQUIRE_HOME_SIGN_IN) === 'true',
    allowAnonymousHome:
      trimEnv(process.env.NEXT_PUBLIC_ALLOW_ANONYMOUS_HOME) === 'true' ||
      trimEnv(process.env.VITE_ALLOW_ANONYMOUS_HOME) === 'true',
  }
}
