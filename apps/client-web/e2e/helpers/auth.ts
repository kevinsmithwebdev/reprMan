import { expect, type Page } from '@playwright/test'

import { e2eEnv } from './env'

const appOrigin = () =>
  (process.env.E2E_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

const cognitoEnvHint =
  'Set NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ' +
  '(or legacy VITE_COGNITO_*) in .env at the repo root.'

/** Navigate to the app; surfaces a clear error when the dev server is not running. */
export async function gotoApp(
  page: Page,
  path: string,
  options: Parameters<Page['goto']>[1] = { waitUntil: 'domcontentloaded' }
): Promise<void> {
  const url = path.startsWith('http') ? path : `${appOrigin()}${path}`
  try {
    await page.goto(url, options)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/ERR_CONNECTION_REFUSED|ECONNREFUSED/i.test(message)) {
      throw new Error(
        `Cannot reach ${appOrigin()} (${message}). ` +
          'Playwright should start the app via `yarn start` unless E2E_SKIP_WEB_SERVER=1. ' +
          'If port 3000 is in use by another process, stop it or set E2E_REUSE_EXISTING_SERVER=1 only when `yarn start` is already running.'
      )
    }
    throw error
  }
}

/** Clear saved session (guest flows). */
export const guestStorageState = {
  cookies: [] as {
    name: string
    value: string
    domain: string
    path: string
  }[],
  origins: [] as {
    origin: string
    localStorage: { name: string; value: string }[]
  }[],
}

/** Click a button that may be covered by the sticky footer. */
async function clickButton(page: Page, name: string): Promise<void> {
  const button = page.getByRole('button', { name, exact: true })
  await button.evaluate((el) => {
    el.scrollIntoView({ block: 'center', inline: 'nearest' })
    ;(el as HTMLButtonElement).click()
  })
}

/** Confirm the active Bootstrap modal (double confirmation for destructive actions). */
export async function confirmDialogYes(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 15_000 })
  await dialog.getByRole('button', { name: 'Yes', exact: true }).click()
}

/**
 * Removes every repr via Settings (two confirmations). Use only for the dedicated
 * E2E Cognito user — all repertoire data for that account is deleted.
 */
async function confirmDeleteAllReprs(page: Page): Promise<void> {
  await clickButton(page, 'Delete All Reprs')
  await confirmDialogYes(page)
  await expect(page.getByText('Last Chance')).toBeVisible({ timeout: 15_000 })
  await confirmDialogYes(page)
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15_000 })
}

export async function clearAllReprsViaSettings(page: Page): Promise<void> {
  const clearFailed = page.getByText('Could not clear all reprs', {
    exact: false,
  })

  await expect(async () => {
    await gotoApp(page, '/')
    await waitForHomeControls(page)
    if ((await readHomeReprCount(page)) === 0) {
      return
    }

    await gotoApp(page, '/settings')
    await expect(page.locator('#Settings-page')).toBeVisible({
      timeout: 60_000,
    })
    await confirmDeleteAllReprs(page)
    await expect(clearFailed).not.toBeVisible({ timeout: 180_000 })

    await gotoApp(page, '/')
    await waitForHomeControls(page)
    const remaining = await readHomeReprCount(page)
    if (await clearFailed.isVisible().catch(() => false)) {
      throw new Error(
        'Delete All Reprs failed. Clear the E2E user manually in Settings, or fix Dev API access, then re-run tests.'
      )
    }
    if (remaining > 0) {
      throw new Error(`Still ${remaining} reprs after delete-all`)
    }
    if (
      !(await page
        .locator('#add-repr-button')
        .isEnabled()
        .catch(() => false))
    ) {
      throw new Error('Add Repr still disabled after delete-all')
    }
  }).toPass({ timeout: 300_000 })
}

/**
 * Home toolbar appears only after reprs finish loading. Polls without re-navigating:
 * each full page load remounts AppShell and re-dispatches genesis, which resets reprs
 * and can prevent loadReprs from ever completing during retries.
 */
export async function waitForHomeControls(page: Page): Promise<void> {
  const pathname = () => new URL(page.url()).pathname
  if (pathname() !== '/') {
    await gotoApp(page, '/')
  }
  await acceptTermsIfRequired(page)

  await expect(async () => {
    if (
      await page
        .locator('#controls-home-component')
        .isVisible()
        .catch(() => false)
    ) {
      return
    }

    if (pathname() !== '/') {
      throw new Error(
        `Expected home controls on / but the page is at ${pathname()}.`
      )
    }

    await acceptTermsIfRequired(page)

    await expect(
      page
        .locator('#cognito-user-avatar-toggle')
        .or(page.locator('#cognito-sign-in-open'))
    ).toBeVisible({ timeout: 30_000 })

    const homeLoading = page.locator('#Home-page [role="status"]')
    if (await homeLoading.isVisible().catch(() => false)) {
      await expect(homeLoading).not.toBeVisible({ timeout: 90_000 })
    }

    const signedOutHome = page
      .locator('#Home-page')
      .getByRole('link', { name: /^sign in$/i })
    if (await signedOutHome.isVisible().catch(() => false)) {
      throw new Error(
        'Home shows the signed-out card while waiting for authenticated controls.'
      )
    }

    await expect(page.locator('#controls-home-component')).toBeVisible({
      timeout: 30_000,
    })
  }).toPass({ timeout: 240_000 })
}

/** Open home and wait until Cognito session + repr list are ready (create not required). */
export async function waitForAuthenticatedHome(page: Page): Promise<void> {
  const avatar = page.locator('#cognito-user-avatar-toggle')
  const headerSignIn = page.locator('#cognito-sign-in-open')
  const homeSignUp = page
    .locator('#Home-page')
    .getByRole('link', { name: /^sign up$/i })

  const alreadyOnSignedInHome =
    new URL(page.url()).pathname === '/' &&
    (await avatar.isVisible().catch(() => false))

  if (!alreadyOnSignedInHome) {
    await gotoApp(page, '/')
  }

  await expect(avatar.or(headerSignIn).or(homeSignUp)).toBeVisible({
    timeout: 60_000,
  })

  const needsSignIn =
    (await headerSignIn.isVisible().catch(() => false)) ||
    (await homeSignUp.isVisible().catch(() => false))

  if (needsSignIn) {
    await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('CognitoIdentityServiceProvider.')) {
          localStorage.removeItem(key)
        }
      }
    })
    await signIn(page)
    return
  }

  await acceptTermsIfRequired(page)
  await waitForHomeControls(page)
  await expect(page.locator('#add-repr-button')).toBeVisible({
    timeout: 30_000,
  })
}

/** Same as {@link waitForAuthenticatedHome}. */
export async function goToAuthenticatedHome(page: Page): Promise<void> {
  await waitForAuthenticatedHome(page)
}

const REPR_LIMIT = 100

/** Reads the filtered repr count from the home toolbar (e.g. "94 reprs"). */
export async function readHomeReprCount(page: Page): Promise<number> {
  await expect(page.locator('#controls-home-component')).toBeVisible({
    timeout: 60_000,
  })
  const countLabel = page
    .locator('#controls-home-component')
    .getByText(/\d+\+? reprs?/)
  const text = (await countLabel.textContent()) ?? '0 reprs'
  const match = text.match(/(\d+)/)
  return match ? Number.parseInt(match[1], 10) : 0
}

/** Deletes all reprs when the E2E account already has repertoire data. */
export async function clearReprsIfPresent(page: Page): Promise<void> {
  await waitForAuthenticatedHome(page)
  if ((await readHomeReprCount(page)) > 0) {
    await clearAllReprsViaSettings(page)
  }
}

/** Clears all reprs when at quota so create flows can run. */
export async function ensureCanCreateRepr(page: Page): Promise<void> {
  await ensureReprHeadroom(page, 1)
}

/**
 * Deletes all reprs when the account cannot fit {@link freeSlots} more creates
 * (disabled + Add Repr or count near {@link REPR_LIMIT}).
 */
export async function ensureReprHeadroom(
  page: Page,
  freeSlots = 1
): Promise<void> {
  await waitForAuthenticatedHome(page)
  const count = await readHomeReprCount(page)
  const addRepr = page.locator('#add-repr-button')
  const addEnabled = await addRepr.isEnabled().catch(() => false)
  const needClear = !addEnabled || count + freeSlots > REPR_LIMIT

  if (!needClear) {
    return
  }

  await clearAllReprsViaSettings(page)

  if (!(await addRepr.isEnabled().catch(() => false))) {
    throw new Error(
      'Cannot create reprs: account is at the repr limit and automatic cleanup did not free space. ' +
        'Use Settings → Delete All Reprs for the E2E user, or a dedicated test account.'
    )
  }
}

export async function acceptTermsIfRequired(page: Page): Promise<void> {
  const termsCheckbox = page.locator('#accept-terms-gate')
  const visible = await termsCheckbox.isVisible().catch(() => false)
  if (!visible) {
    return
  }
  await termsCheckbox.check()
  await page.getByRole('button', { name: 'Accept' }).click()
  await expect(termsCheckbox).not.toBeVisible({ timeout: 15_000 })
}

/** Waits until the header shows a signed-in session. */
export async function waitForSignedIn(page: Page): Promise<void> {
  try {
    await expect(page.locator('#cognito-user-avatar-toggle')).toBeVisible({
      timeout: 60_000,
    })
  } catch {
    const stillOnSignIn = await page
      .locator('#SignIn-page')
      .isVisible()
      .catch(() => false)
    const toastBody = await page
      .locator('.toast-body')
      .first()
      .textContent()
      .catch(() => null)
    const toastHint = toastBody?.trim()
      ? `App message: "${toastBody.trim()}"`
      : 'No error toast was shown.'
    const hint = stillOnSignIn
      ? `Still on the sign-in page. ${toastHint}`
      : `Signed-in UI did not appear. ${toastHint}`

    throw new Error(
      `${hint} Verify E2E_USER_EMAIL / E2E_USER_PASSWORD in .env.e2e, that the user exists and is confirmed in the Cognito pool from .env (NEXT_PUBLIC_COGNITO_* or VITE_COGNITO_*), and that NEXT_PUBLIC_REPRS_API_BASE_URL (or VITE_REPRS_API_BASE_URL) is reachable.`
    )
  }
}

export async function signIn(
  page: Page,
  email = e2eEnv.userEmail(),
  password = e2eEnv.userPassword()
): Promise<void> {
  await gotoApp(page, '/signin')
  await expect(page).toHaveURL(/\/signin(?:\?.*)?$/, { timeout: 15_000 })
  await expect(page.locator('#SignIn-page')).toBeVisible({ timeout: 30_000 })

  const emailField = page
    .locator('#signin-page-email')
    .or(page.getByRole('textbox', { name: /^email$/i }))
  const passwordField = page
    .locator('#signin-page-password')
    .or(page.getByRole('textbox', { name: /^password$/i }))

  try {
    await expect(emailField.first()).toBeVisible({ timeout: 60_000 })
  } catch {
    const spinnerVisible = await page
      .locator('#SignIn-page [role="status"]')
      .isVisible()
      .catch(() => false)
    if (spinnerVisible) {
      throw new Error(
        'Sign-in form did not load in time (Cognito session check still pending). ' +
          `Retry, or verify ${cognitoEnvHint}`
      )
    }
    throw new Error(
      'Sign-in form is not available on /signin (auth may be unconfigured). ' +
        cognitoEnvHint
    )
  }

  await emailField.first().fill(email)
  await passwordField.first().fill(password)
  await page
    .locator('#SignIn-page')
    .getByRole('button', { name: 'Sign In', exact: true })
    .click()
  await waitForSignedIn(page)
  if (new URL(page.url()).pathname === '/signin') {
    await expect(page).toHaveURL(/\/$/, { timeout: 60_000 })
  }
  await acceptTermsIfRequired(page)
  await waitForHomeControls(page)
  await expect(page.locator('#add-repr-button')).toBeVisible({
    timeout: 30_000,
  })
}

export async function signOut(page: Page): Promise<void> {
  await page.locator('#cognito-user-avatar-toggle').click()
  await page.locator('#cognito-sign-out').click()
  await expect(page.locator('#cognito-sign-in-open')).toBeVisible({
    timeout: 15_000,
  })
}

export async function registerAccount(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await gotoApp(page, '/signup')
  await expect(page.locator('#Signup-page')).toBeVisible({ timeout: 30_000 })
  await page.locator('#signup-email').fill(email)
  await page.locator('#signup-password').fill(password)
  await page.locator('#signup-password-confirm').fill(password)
  await page.locator('#signup-terms').check()
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.locator('#signup-code')).toBeVisible({ timeout: 30_000 })
}

export async function confirmSignup(page: Page, code: string): Promise<void> {
  await page.locator('#signup-code').fill(code)
  await page.getByRole('button', { name: 'Confirm and sign in' }).click()
  await waitForSignedIn(page)
  await acceptTermsIfRequired(page)
}
