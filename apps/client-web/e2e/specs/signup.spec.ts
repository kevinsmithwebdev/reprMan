import { test } from '@playwright/test'

import {
  confirmSignup,
  guestStorageState,
  registerAccount,
} from '../helpers/auth'
import { e2eEnv, uniqueSuffix } from '../helpers/env'

test.describe('create account', () => {
  test.use({ storageState: guestStorageState })

  test.beforeEach(() => {
    test.skip(
      !e2eEnv.runSignup,
      'Set E2E_RUN_SIGNUP=1 to run signup tests against Cognito'
    )
  })

  test('completes registration when a confirmation code is provided', async ({
    page,
  }) => {
    test.skip(
      !e2eEnv.signupConfirmCode,
      'Set E2E_SIGNUP_CONFIRM_CODE from the verification email'
    )

    const email = `e2e-signup-${uniqueSuffix()}@${e2eEnv.signupDomain}`
    const password = `E2e!${uniqueSuffix()}Aa1`

    await registerAccount(page, email, password)
    await confirmSignup(page, e2eEnv.signupConfirmCode)
  })

  test('reaches the email confirmation step after register', async ({
    page,
  }) => {
    const email = `e2e-signup-${uniqueSuffix()}@${e2eEnv.signupDomain}`
    const password = `E2e!${uniqueSuffix()}Aa1`

    await registerAccount(page, email, password)
  })
})
