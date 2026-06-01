import { expect, test } from '@playwright/test'

import { gotoApp, guestStorageState, signIn } from '../helpers/auth'
import { e2eEnv } from '../helpers/env'

test.describe('sign in', () => {
  test.use({ storageState: guestStorageState })

  test('logs in with email and password', async ({ page }) => {
    await signIn(page)
    await expect(page.locator('#add-repr-button')).toBeVisible()
    await expect(page.locator('#cognito-user-avatar-toggle')).toBeVisible()
  })
})

test.describe('sign in page', () => {
  test.use({ storageState: guestStorageState })

  test('navigates from home to sign in', async ({ page }) => {
    await gotoApp(page, '/')
    await page.getByRole('button', { name: 'Sign In' }).first().click()
    await expect(page).toHaveURL(/\/signin/)
    await expect(page.locator('#SignIn-page')).toBeVisible()
    await expect(page.locator('#signin-page-email')).toBeVisible()
    expect(e2eEnv.userEmail()).toBeTruthy()
  })
})
