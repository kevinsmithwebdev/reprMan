import { test as setup } from '@playwright/test'
import path from 'node:path'

import { ensureReprHeadroom, signIn } from './helpers/auth'

const authFile = path.join(__dirname, '.auth', 'user.json')

setup.setTimeout(360_000)

setup('authenticate test user', async ({ page }) => {
  await signIn(page)
  if (process.env.E2E_SKIP_CLEAR_REPRS_ON_SETUP === '1') {
    await ensureReprHeadroom(page, 1)
  } else {
    await ensureReprHeadroom(page, 15)
  }
  await page.context().storageState({ path: authFile })
})
