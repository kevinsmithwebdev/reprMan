import { Amplify } from 'aws-amplify'

const trimEnv = (v: string | undefined) => (v ?? '').trim()
const env = (key: string) =>
  trimEnv(import.meta.env[key as keyof ImportMetaEnv] as string | undefined)

/**
 * Vite injects env at compile time. `nx serve client-web` runs `vite` with
 * `envDir` pointing at the repo root, so values are read from `<repo>/.env`
 * (see apps/client-web/vite.config.ts). Production / CI typically set the same
 * `VITE_*` variables in the host environment instead.
 */
export function isCognitoConfigured(): boolean {
  return Boolean(
    env('VITE_COGNITO_USER_POOL_ID') && env('VITE_COGNITO_USER_POOL_CLIENT_ID')
  )
}

/**
 * When `true`, show the home sign-in wall even if Cognito env vars were not baked into this build
 * (you will see setup instructions until vars are added and the dev server restarted).
 */
export function requireHomeSignInWall(): boolean {
  return env('VITE_REQUIRE_HOME_SIGN_IN') === 'true'
}

/**
 * Skip the home Sign In / Sign Up card and use the repr list without signing in (e.g. local dev).
 */
export function allowAnonymousHome(): boolean {
  return env('VITE_ALLOW_ANONYMOUS_HOME') === 'true'
}

/**
 * When true, "/" shows Sign In / Sign Up while signed out, and header/settings follow the same rules.
 * Default: on (so buttons appear even if Cognito env vars are missing — you will see the setup warning).
 * Set VITE_ALLOW_ANONYMOUS_HOME=true to turn this off when Cognito is not configured.
 */
export function homeAuthGateActive(): boolean {
  return (
    isCognitoConfigured() ||
    requireHomeSignInWall() ||
    !allowAnonymousHome()
  )
}

/**
 * Call once at startup. When env vars are unset, the app runs without Cognito (unchanged behavior).
 */
export function configureAmplify(): void {
  const userPoolId = env('VITE_COGNITO_USER_POOL_ID')
  const userPoolClientId = env('VITE_COGNITO_USER_POOL_CLIENT_ID')
  const identityPoolId = env('VITE_COGNITO_IDENTITY_POOL_ID')

  if (!userPoolId || !userPoolClientId) {
    console.error(
      '[env] Missing Cognito configuration: VITE_COGNITO_USER_POOL_ID and/or VITE_COGNITO_USER_POOL_CLIENT_ID'
    )
  }

  if (!env('VITE_REPRS_API_BASE_URL')) {
    console.error(
      '[env] Missing VITE_REPRS_API_BASE_URL: repr API disabled, local fallback active'
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
