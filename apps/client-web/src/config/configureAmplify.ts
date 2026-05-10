import { Amplify } from 'aws-amplify'

const trimEnv = (v: string | undefined) => (v ?? '').trim()

/**
 * CRA injects env at compile time. `yarn start` / build / test load `apps/client-web/.env`
 * via dotenv-cli — see apps/client-web/project.json (or `apps/client-web/package.json` scripts).
 * Production and CI typically set the same `REACT_APP_*` variables in the host environment instead.
 */
const userPoolId = trimEnv(process.env.REACT_APP_COGNITO_USER_POOL_ID)
const userPoolClientId = trimEnv(
  process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID
)
const identityPoolId = trimEnv(process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID)

export const isCognitoConfigured = Boolean(userPoolId && userPoolClientId)

/**
 * When `true`, show the home sign-in wall even if Cognito env vars were not baked into this build
 * (you will see setup instructions until vars are added and the dev server restarted).
 */
export const requireHomeSignInWall =
  process.env.REACT_APP_REQUIRE_HOME_SIGN_IN === 'true'

/**
 * Skip the home Sign In / Sign Up card and use the repr list without signing in (e.g. local dev).
 */
export const allowAnonymousHome =
  process.env.REACT_APP_ALLOW_ANONYMOUS_HOME === 'true'

/**
 * When true, "/" shows Sign In / Sign Up while signed out, and header/settings follow the same rules.
 * Default: on (so buttons appear even if Cognito env vars are missing — you will see the setup warning).
 * Set REACT_APP_ALLOW_ANONYMOUS_HOME=true to turn this off when Cognito is not configured.
 */
export const homeAuthGateActive =
  isCognitoConfigured || requireHomeSignInWall || !allowAnonymousHome

/**
 * Call once at startup. When env vars are unset, the app runs without Cognito (unchanged behavior).
 */
export function configureAmplify(): void {
  if (!userPoolId || !userPoolClientId) {
    console.error(
      '[env] Missing Cognito configuration: REACT_APP_COGNITO_USER_POOL_ID and/or REACT_APP_COGNITO_USER_POOL_CLIENT_ID'
    )
  }

  if (!trimEnv(process.env.REACT_APP_REPRS_API_BASE_URL)) {
    console.error(
      '[env] Missing REACT_APP_REPRS_API_BASE_URL: repr API disabled, local fallback active'
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
