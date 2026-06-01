import { expect, type Page } from '@playwright/test'

import { e2eEnv } from './env'

const appOrigin = () =>
  (process.env.E2E_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

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
    await expect(page.locator('#controls-home-component')).toBeVisible({
      timeout: 30_000,
    })
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
    await expect(page.locator('#controls-home-component')).toBeVisible({
      timeout: 30_000,
    })
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

/** Open home and wait until Cognito session + repr list are ready (create not required). */
export async function waitForAuthenticatedHome(page: Page): Promise<void> {
  await gotoApp(page, '/')

  const avatar = page.locator('#cognito-user-avatar-toggle')
  const signUpOnHomeWall = page
    .locator('#Home-page')
    .getByRole('button', { name: 'Sign Up' })

  await expect(avatar.or(signUpOnHomeWall)).toBeVisible({ timeout: 60_000 })

  if (await signUpOnHomeWall.isVisible()) {
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
  await expect(page.locator('#add-repr-button')).toBeVisible({
    timeout: 60_000,
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
      `${hint} Verify E2E_USER_EMAIL / E2E_USER_PASSWORD in .env.e2e, that the user exists and is confirmed in the Cognito pool from .env (VITE_COGNITO_*), and that VITE_REPRS_API_BASE_URL is reachable.`
    )
  }
}

export async function signIn(
  page: Page,
  email = e2eEnv.userEmail(),
  password = e2eEnv.userPassword()
): Promise<void> {
  await gotoApp(page, '/signin')
  await expect(page.locator('#SignIn-page')).toBeVisible({ timeout: 30_000 })
  await page.locator('#signin-page-email').fill(email)
  await page.locator('#signin-page-password').fill(password)
  await page
    .locator('#SignIn-page')
    .getByRole('button', { name: 'Sign In', exact: true })
    .click()
  await waitForSignedIn(page)
  await acceptTermsIfRequired(page)
  await expect(page.locator('#add-repr-button')).toBeVisible({
    timeout: 60_000,
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
