import { expect, test } from '@playwright/test'

import { goToAuthenticatedHome, signOut } from '../helpers/auth'

test.describe('sign out', () => {
  test('logs out from the user menu', async ({ page }) => {
    await goToAuthenticatedHome(page)
    await signOut(page)
    await expect(page).toHaveURL(/\/signin/)
    await expect(page.locator('#SignIn-page')).toBeVisible()
    await expect(page.locator('#cognito-sign-in-open')).toBeVisible()
  })
})
