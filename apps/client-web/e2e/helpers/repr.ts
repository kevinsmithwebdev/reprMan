import { expect, type Page } from '@playwright/test'

import { waitForAuthenticatedHome } from './auth'

export type CreateReprOptions = {
  title: string
  comment?: string
  categories?: string[]
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
    await waitForAuthenticatedHome(page)
  }
  const addRepr = page.locator('#add-repr-button')
  if (!(await addRepr.isEnabled().catch(() => false))) {
    throw new Error(
      'Cannot create repr: account is at the repr limit. Call ensureCanCreateRepr() once before creating reprs in this test, or clear test data for the E2E user.'
    )
  }
  await addRepr.click()
  await expect(page.locator('#edit-repr-modal')).toBeVisible()

  await page.locator('#edit-repr-title-input').fill(title)
  if (comment) {
    await page.getByPlaceholder('Enter comment...').fill(comment)
  }

  for (const category of categories) {
    const categoryInput = page.getByPlaceholder('Enter new category...')
    await categoryInput.fill(category)
    await categoryInput.press('Enter')
    await expect(
      page.locator('#edit-repr-modal').getByText(category)
    ).toBeVisible()
  }

  await page.locator('#edit-repr-save-button').click()
  await expect(page.locator('#edit-repr-modal')).not.toBeVisible({
    timeout: 15_000,
  })
  await expect(reprCard(page, title)).toBeVisible({ timeout: 15_000 })
}

export function reprCard(page: Page, title: string) {
  return page.locator('.repr-line-component').filter({ hasText: title })
}

export async function openReprFromHome(
  page: Page,
  title: string
): Promise<void> {
  const card = reprCard(page, title)
  if (!(await card.isVisible().catch(() => false))) {
    await waitForAuthenticatedHome(page)
  }
  await card.click()
  await expect(page).toHaveURL(/\/view\//)
  await expect(page.getByText(title).first()).toBeVisible()
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
  await expect(page.locator('#edit-repr-modal')).toBeVisible({
    timeout: 15_000,
  })
  await page.locator('#edit-repr-title-input').fill(newTitle)
  await page.locator('#edit-repr-save-button').click()
  await expect(page.locator('#edit-repr-modal')).not.toBeVisible()
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

/** Home toolbar is shown only after reprs have finished loading. */
export async function waitForHomeControls(page: Page): Promise<void> {
  await expect(page.locator('#controls-home-component')).toBeVisible({
    timeout: 60_000,
  })
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
  await page.getByRole('button', { name: 'Open category filter' }).click()
  await page
    .locator('#filter-form')
    .getByLabel(category, { exact: true })
    .check()
}

export async function clearCategoryFilters(page: Page): Promise<void> {
  const filterButton = page.getByRole('button', {
    name: 'Open category filter',
  })
  if (!(await filterButton.isVisible().catch(() => false))) {
    return
  }
  await filterButton.click()
  const checkboxes = page.locator('#filter-form input[type="checkbox"]:checked')
  const count = await checkboxes.count()
  for (let i = 0; i < count; i += 1) {
    await checkboxes.nth(0).uncheck()
  }
  await filterButton.click()
}
