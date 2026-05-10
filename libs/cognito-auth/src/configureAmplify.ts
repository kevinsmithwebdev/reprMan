import { Amplify } from 'aws-amplify'

const trimEnv = (v: string | undefined) => (v ?? '').trim()

/**
 * Vite injects env at compile time. `nx serve client-web` runs `vite` with
 * `envDir` pointing at the repo root, so values are read from `<repo>/.env`
 * (see apps/client-web/vite.config.ts). Production / CI typically set the same
 * `VITE_*` variables in the host environment instead.
 */
const userPoolId = trimEnv(import.meta.env.VITE_COGNITO_USER_POOL_ID)
const userPoolClientId = trimEnv(
  import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID
)
const identityPoolId = trimEnv(import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID)

export const isCognitoConfigured = Boolean(userPoolId && userPoolClientId)

/**
 * When `true`, show the home sign-in wall even if Cognito env vars were not baked into this build
 * (you will see setup instructions until vars are added and the dev server restarted).
 */
export const requireHomeSignInWall =
  import.meta.env.VITE_REQUIRE_HOME_SIGN_IN === 'true'

/**
 * Skip the home Sign In / Sign Up card and use the repr list without signing in (e.g. local dev).
 */
export const allowAnonymousHome =
  import.meta.env.VITE_ALLOW_ANONYMOUS_HOME === 'true'

/**
 * When true, "/" shows Sign In / Sign Up while signed out, and header/settings follow the same rules.
 * Default: on (so buttons appear even if Cognito env vars are missing — you will see the setup warning).
 * Set VITE_ALLOW_ANONYMOUS_HOME=true to turn this off when Cognito is not configured.
 */
export const homeAuthGateActive =
  isCognitoConfigured || requireHomeSignInWall || !allowAnonymousHome

/**
 * Call once at startup. When env vars are unset, the app runs without Cognito (unchanged behavior).
 */
export function configureAmplify(): void {
  if (!userPoolId || !userPoolClientId) {
    console.error(
      '[env] Missing Cognito configuration: VITE_COGNITO_USER_POOL_ID and/or VITE_COGNITO_USER_POOL_CLIENT_ID'
    )
  }

  if (!trimEnv(import.meta.env.VITE_REPRS_API_BASE_URL)) {
    console.error(
      '[env] Missing VITE_REPRS_API_BASE_URL: repr API disabled, local fallback active'
    )
  }

  if (!isCognitoConfigured) {
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
