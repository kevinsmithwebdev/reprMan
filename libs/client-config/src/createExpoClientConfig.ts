import Constants from 'expo-constants'
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

const expoEnv = (): Record<string, string | undefined> => {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<
    string,
    string | undefined
  >

  return {
    EXPO_PUBLIC_COGNITO_USER_POOL_ID:
      process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID ??
      extra.EXPO_PUBLIC_COGNITO_USER_POOL_ID,
    EXPO_PUBLIC_COGNITO_USER_POOL_CLIENT_ID:
      process.env.EXPO_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ??
      extra.EXPO_PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
    EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID:
      process.env.EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID ??
      extra.EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID,
    EXPO_PUBLIC_REPRS_API_BASE_URL:
      process.env.EXPO_PUBLIC_REPRS_API_BASE_URL ??
      extra.EXPO_PUBLIC_REPRS_API_BASE_URL,
    EXPO_PUBLIC_REQUIRE_HOME_SIGN_IN:
      process.env.EXPO_PUBLIC_REQUIRE_HOME_SIGN_IN ??
      extra.EXPO_PUBLIC_REQUIRE_HOME_SIGN_IN,
    EXPO_PUBLIC_ALLOW_ANONYMOUS_HOME:
      process.env.EXPO_PUBLIC_ALLOW_ANONYMOUS_HOME ??
      extra.EXPO_PUBLIC_ALLOW_ANONYMOUS_HOME,
  }
}

/**
 * Build config from Expo `EXPO_PUBLIC_*` vars (mirrors web `VITE_*` keys).
 */
export const createExpoClientConfig = (
  env: Record<string, string | undefined> = expoEnv()
): ClientConfig => ({
  cognitoUserPoolId: readEnv(env, 'EXPO_PUBLIC_COGNITO_USER_POOL_ID'),
  cognitoUserPoolClientId: readEnv(
    env,
    'EXPO_PUBLIC_COGNITO_USER_POOL_CLIENT_ID'
  ),
  cognitoIdentityPoolId: readEnv(env, 'EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID'),
  reprsApiBaseUrl: readEnv(env, 'EXPO_PUBLIC_REPRS_API_BASE_URL'),
  requireHomeSignIn: readBoolEnv(env, 'EXPO_PUBLIC_REQUIRE_HOME_SIGN_IN'),
  allowAnonymousHome: readBoolEnv(env, 'EXPO_PUBLIC_ALLOW_ANONYMOUS_HOME'),
})
