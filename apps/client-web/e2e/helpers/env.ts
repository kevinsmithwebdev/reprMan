const required = (name: string): string => {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy apps/client-web/e2e/env.e2e.example to .env.e2e (or export vars) and set credentials for the Dev Cognito user pool.`
    )
  }
  return value
}

export const e2eEnv = {
  baseUrl: process.env.E2E_BASE_URL?.trim() || 'http://localhost:3000',
  userEmail: () => required('E2E_USER_EMAIL'),
  userPassword: () => required('E2E_USER_PASSWORD'),
  signupDomain: process.env.E2E_SIGNUP_DOMAIN?.trim() || 'example.com',
  signupConfirmCode: process.env.E2E_SIGNUP_CONFIRM_CODE?.trim() || '',
  runSignup: process.env.E2E_RUN_SIGNUP === '1',
}

export const uniqueSuffix = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
