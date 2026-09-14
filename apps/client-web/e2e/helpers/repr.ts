import { expect, type Locator, type Page } from '@playwright/test'

import {
  ensureCanCreateRepr,
  goToAuthenticatedHome,
  waitForAuthenticatedHome,
  waitForHomeControls,
} from './auth'

export type CreateReprOptions = {
  title: string
  comment?: string
  categories?: string[]
}

const reprLimitUnavailableDialog = (page: Page) =>
  page.getByRole('dialog', { name: /repr limit unavailable/i })

const reprLimitExceededDialog = (page: Page) =>
  page.getByRole('dialog', { name: /allowed reprs exceeded/i })

const createReprTitleInput = (page: Page) =>
  page.locator('.modal.show').getByRole('textbox').first()

export async function assertNoRateLimitToast(page: Page): Promise<void> {
  const rateLimit = page
    .getByRole('alert')
    .filter({ hasText: /rate limit exceeded/i })
    .or(page.getByText(/rate limit exceeded/i))
  if (
    await rateLimit
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    throw new Error(
      'ReprMan API write rate limit exceeded. Wait for the limit to reset before re-running e2e.'
    )
  }
}

async function assertReprSaveDidNotFail(page: Page): Promise<void> {
  const failNotice = page
    .getByRole('alert')
    .filter({ hasText: /could not save|rate limit exceeded/i })
    .or(
      page.locator('.toast-body').filter({
        hasText: /could not save|rate limit exceeded/i,
      })
    )
  if (
    await failNotice
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    const message = (await failNotice.first().textContent())?.trim()
    throw new Error(message ?? 'Repr save failed')
  }
}

function reprCardExact(page: Page, title: string): Locator {
  return page
    .locator('.repr-line-component')
    .filter({ has: page.getByText(title, { exact: true }) })
}

async function isCreateReprFormOpen(page: Page): Promise<boolean> {
  return createReprTitleInput(page)
    .isVisible()
    .catch(() => false)
}

async function openCreateReprForm(page: Page): Promise<void> {
  if (await isCreateReprFormOpen(page)) {
    return
  }

  if (
    !(await page
      .locator('#controls-home-component')
      .isVisible()
      .catch(() => false))
  ) {
    await goToAuthenticatedHome(page)
    await waitForHomeControls(page)
  }

  await expect(async () => {
    const addRepr = page.locator('#add-repr-button')
    if (await addRepr.isEnabled().catch(() => false)) {
      return
    }
    await ensureCanCreateRepr(page)
    await expect(addRepr).toBeEnabled({ timeout: 5_000 })
  }).toPass({ timeout: 120_000 })

  // Quota may still be loading after home controls appear; EditRepr shows
  // "Repr limit unavailable" until /user/config finishes (or falls back).
  // Do not wait for subscription header/menu text — paid/unlimited hide the
  // banner, and a failed config can leave the menu on "Loading…" forever.
  await expect(async () => {
    if (await isCreateReprFormOpen(page)) {
      return
    }

    const quotaDialog = reprLimitUnavailableDialog(page)
    const limitExceededDialog = reprLimitExceededDialog(page)
    if (await quotaDialog.isVisible().catch(() => false)) {
      await quotaDialog.getByLabel(/^close$/i).click()
      throw new Error('Repr quota not loaded yet')
    }
    if (await limitExceededDialog.isVisible().catch(() => false)) {
      await limitExceededDialog.getByLabel(/^close$/i).click()
      await ensureCanCreateRepr(page)
      throw new Error('At repr limit; cleared reprs, retrying')
    }

    await page.locator('#add-repr-button').click()

    if (await quotaDialog.isVisible().catch(() => false)) {
      await quotaDialog.getByLabel(/^close$/i).click()
      throw new Error('Repr quota not loaded yet')
    }
    if (await limitExceededDialog.isVisible().catch(() => false)) {
      await limitExceededDialog.getByLabel(/^close$/i).click()
      await ensureCanCreateRepr(page)
      throw new Error('At repr limit; cleared reprs, retrying')
    }

    await expect(createReprTitleInput(page)).toBeVisible({ timeout: 5_000 })
  }).toPass({ timeout: 60_000 })
}

export async function createRepr(
  page: Page,
  { title, comment = '', categories = [] }: CreateReprOptions
): Promise<void> {
  if (
    await page
      .locator('#controls-home-component')
      .isVisible()
      .catch(() => false)
  ) {
    await waitForHomeControls(page)
  } else {
    await goToAuthenticatedHome(page)
    await waitForHomeControls(page)
  }

  await ensureCanCreateRepr(page)
  await openCreateReprForm(page)

  const titleInput = createReprTitleInput(page)
  await titleInput.fill(title)
  if (comment) {
    await page.getByPlaceholder('Enter comment...').fill(comment)
  }

  for (const category of categories) {
    const categoryInput = page.getByPlaceholder('Enter new category...')
    await categoryInput.fill(category)
    await categoryInput.press('Enter')
    await expect(page.getByRole('dialog').getByText(category)).toBeVisible()
  }

  const upsertResponse = page.waitForResponse(
    (resp) =>
      resp.request().method() === 'PUT' &&
      /\/reprs\/[^/]+$/.test(new URL(resp.url()).pathname),
    { timeout: 30_000 }
  )

  await page.locator('#edit-repr-save-button').click()
  await expect(titleInput).not.toBeVisible({
    timeout: 15_000,
  })

  const saveResult = await upsertResponse
  if (saveResult.status() >= 400) {
    const body = (await saveResult.text().catch(() => '')).trim()
    if (saveResult.status() === 429) {
      let waitHint = ''
      try {
        const parsed = JSON.parse(body) as { retryAfterSeconds?: number }
        if (
          typeof parsed.retryAfterSeconds === 'number' &&
          Number.isFinite(parsed.retryAfterSeconds)
        ) {
          const minutes = Math.ceil(parsed.retryAfterSeconds / 60)
          waitHint = ` Retry in about ${minutes} minute${
            minutes === 1 ? '' : 's'
          }.`
        }
      } catch {
        // Keep the raw body when retryAfterSeconds is missing.
      }
      throw new Error(
        `API write rate limit exceeded (60 writes/hour).${waitHint} ` +
          'This is not an app bug — wait for the window to reset, or use a dedicated E2E Cognito user / raise RATE_LIMIT_WRITE_PER_HOUR on the API. ' +
          `Details: ${body || '429'}`
      )
    }
    throw new Error(
      `Create repr failed (${saveResult.status()}${body ? `: ${body}` : ''})`
    )
  }

  await assertNoRateLimitToast(page)
  await assertReprSaveDidNotFail(page)
  await expect(reprCardExact(page, title)).toBeVisible({ timeout: 30_000 })
}

export function reprCard(page: Page, title: string) {
  return reprCardExact(page, title)
}

export async function openReprFromHome(
  page: Page,
  title: string
): Promise<void> {
  await waitForHomeControls(page)
  await resetHomeFilters(page)

  await expect(async () => {
    await assertNoRateLimitToast(page)
    const card = reprCardExact(page, title).first()
    await expect(card).toBeVisible({ timeout: 3_000 })
    await page.locator('#footer-component').evaluate((footer) => {
      footer.style.pointerEvents = 'none'
    })
    await card.locator('.card-title').click({ timeout: 3_000 })
    await expect(page).toHaveURL(/\/view\//, { timeout: 5_000 })
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible({
      timeout: 3_000,
    })
  }).toPass({ timeout: 45_000 })
}

/** View repr card buttons sit above the sticky footer, which blocks normal Playwright clicks. */
async function clickViewReprCardButton(
  page: Page,
  name: string,
  { exact = false }: { exact?: boolean } = {}
): Promise<void> {
  await page.locator('#footer-component').evaluate((footer) => {
    footer.style.pointerEvents = 'none'
  })
  const button = page.locator('.card').getByRole('button', { name, exact })
  await button.evaluate((el) => {
    el.scrollIntoView({ block: 'center', inline: 'nearest' })
    ;(el as HTMLButtonElement).click()
  })
}

export async function editReprOnViewPage(
  page: Page,
  newTitle: string
): Promise<void> {
  await clickViewReprCardButton(page, 'Edit')
  const titleInput = createReprTitleInput(page)
  await expect(titleInput).toBeVisible({
    timeout: 15_000,
  })
  await titleInput.fill(newTitle)
  await page.locator('#edit-repr-save-button').click()
  await expect(titleInput).not.toBeVisible()
  await expect(page.getByText(newTitle).first()).toBeVisible()
}

export async function deleteReprOnViewPage(page: Page): Promise<void> {
  await clickViewReprCardButton(page, 'Delete', { exact: true })
  const confirmDialog = page.getByRole('dialog')
  await expect(confirmDialog).toBeVisible({ timeout: 15_000 })
  await confirmDialog.getByRole('button', { name: 'Yes', exact: true }).click()
  await expect(page.locator('#controls-home-component')).toBeVisible({
    timeout: 15_000,
  })
}

export async function markReprPracticed(
  page: Page,
  title: string
): Promise<void> {
  const card = reprCard(page, title)
  if (!(await card.isVisible().catch(() => false))) {
    await waitForAuthenticatedHome(page)
  }
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: 'Mark Practiced' }).click()
  await expect(card.getByText(/never/i)).not.toBeVisible({ timeout: 10_000 })
}

export async function resetHomeFilters(page: Page): Promise<void> {
  await waitForHomeControls(page)
  await page.locator('#category-filter-text-input').fill('')
  await clearCategoryFilters(page)
}

export async function filterReprsByText(
  page: Page,
  text: string
): Promise<void> {
  await resetHomeFilters(page)
  const input = page.locator('#category-filter-text-input')
  await input.fill(text)
  await expect(input).toHaveValue(text)
}

export async function filterReprsByCategory(
  page: Page,
  category: string
): Promise<void> {
  await waitForHomeControls(page)
  await clearCategoryFilters(page)
  await expect(async () => {
    const filterButton = page.getByRole('button', {
      name: 'Open category filter',
    })
    await filterButton.click()
    const checkbox = page
      .locator('#filter-form')
      .getByLabel(category, { exact: true })
    await expect(checkbox).toBeVisible({ timeout: 5_000 })
    await checkbox.check()
  }).toPass({ timeout: 60_000 })
}

export async function clearCategoryFilters(page: Page): Promise<void> {
  const filterButton = page.getByRole('button', {
    name: 'Open category filter',
  })
  if (!(await filterButton.isVisible().catch(() => false))) {
    return
  }
  const filterForm = page.locator('#filter-form')
  if (!(await filterForm.isVisible().catch(() => false))) {
    await filterButton.click()
  }
  const checkboxes = filterForm.locator('input[type="checkbox"]:checked')
  const count = await checkboxes.count()
  for (let i = 0; i < count; i += 1) {
    await checkboxes.nth(0).uncheck()
  }
  if (await filterForm.isVisible().catch(() => false)) {
    await filterButton.click()
  }
}
