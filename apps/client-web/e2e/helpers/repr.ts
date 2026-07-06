import { expect, type Page } from '@playwright/test'

import {
  goToAuthenticatedHome,
  waitForAuthenticatedHome,
  waitForHomeControls,
  waitForQuotaLoaded,
} from './auth'

export type CreateReprOptions = {
  title: string
  comment?: string
  categories?: string[]
}

const reprLimitUnavailableDialog = (page: Page) =>
  page.getByRole('dialog', { name: /repr limit unavailable/i })

const createReprTitleInput = (page: Page) =>
  page.locator('.modal.show').getByRole('textbox').first()

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

  await waitForQuotaLoaded(page)
  await expect(page.locator('#add-repr-button')).toBeEnabled({
    timeout: 10_000,
  })

  await expect(async () => {
    if (await isCreateReprFormOpen(page)) {
      return
    }

    const quotaDialog = reprLimitUnavailableDialog(page)
    if (await quotaDialog.isVisible().catch(() => false)) {
      await quotaDialog.getByLabel(/^close$/i).click()
      throw new Error('Repr quota not loaded yet')
    }

    await page.locator('#add-repr-button').click()

    if (await quotaDialog.isVisible().catch(() => false)) {
      await quotaDialog.getByLabel(/^close$/i).click()
      throw new Error('Repr quota not loaded yet')
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

  await page.locator('#edit-repr-save-button').click()
  await expect(titleInput).not.toBeVisible({
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
  const card = reprCard(page, title).first()
  if (!(await card.isVisible().catch(() => false))) {
    await waitForAuthenticatedHome(page)
    await waitForHomeControls(page)
    await resetHomeFilters(page)
  }
  await expect(card).toBeVisible({ timeout: 30_000 })
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
  await filterButton.click()
  const checkboxes = page.locator('#filter-form input[type="checkbox"]:checked')
  const count = await checkboxes.count()
  for (let i = 0; i < count; i += 1) {
    await checkboxes.nth(0).uncheck()
  }
  await filterButton.click()
}
