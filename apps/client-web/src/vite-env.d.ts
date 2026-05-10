/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COGNITO_USER_POOL_ID?: string
  readonly VITE_COGNITO_USER_POOL_CLIENT_ID?: string
  readonly VITE_COGNITO_IDENTITY_POOL_ID?: string
  readonly VITE_REPRS_API_BASE_URL?: string
  readonly VITE_REQUIRE_HOME_SIGN_IN?: string
  readonly VITE_ALLOW_ANONYMOUS_HOME?: string
  readonly VITE_VERSION?: string
  readonly VITE_BUILD_NUMBER?: string
  readonly VITE_BUILD_TIME_UTC?: string
  readonly VITE_GIT_SHA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
