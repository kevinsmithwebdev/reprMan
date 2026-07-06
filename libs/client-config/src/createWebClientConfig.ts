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

/**
 * Build config from Vite `import.meta.env` or an explicit env map (tests).
 */
export const createWebClientConfig = (
  env: Record<string, string | undefined> = (
    import.meta as ImportMeta & { env: Record<string, string | undefined> }
  ).env
): ClientConfig => ({
  cognitoUserPoolId: readEnv(env, 'VITE_COGNITO_USER_POOL_ID'),
  cognitoUserPoolClientId: readEnv(env, 'VITE_COGNITO_USER_POOL_CLIENT_ID'),
  cognitoIdentityPoolId: readEnv(env, 'VITE_COGNITO_IDENTITY_POOL_ID'),
  reprsApiBaseUrl: readEnv(env, 'VITE_REPRS_API_BASE_URL'),
  requireHomeSignIn: readBoolEnv(env, 'VITE_REQUIRE_HOME_SIGN_IN'),
  allowAnonymousHome: readBoolEnv(env, 'VITE_ALLOW_ANONYMOUS_HOME'),
})
