import { expect, test } from '@playwright/test'

import { ensureReprHeadroom, goToAuthenticatedHome } from '../helpers/auth'
import { uniqueSuffix } from '../helpers/env'
import {
  createRepr,
  deleteReprOnViewPage,
  editReprOnViewPage,
  filterReprsByCategory,
  filterReprsByText,
  markReprPracticed,
  openReprFromHome,
  reprCard,
  resetHomeFilters,
} from '../helpers/repr'

test.describe.configure({ mode: 'serial', timeout: 300_000 })

// TODO: Re-enable once e2e is not blocked by API write/hour rate limits (60/hour), or e2e uses a higher RATE_LIMIT_WRITE_PER_HOUR / dedicated quota. // NOSONAR
test.describe.skip('reprs', () => {
  // NOSONAR
  test('creates a repr from the home page', async ({ page }) => {
    const title = `E2E Create ${uniqueSuffix()}`
    await createRepr(page, { title, comment: 'Created by Playwright' })
    await expect(reprCard(page, title)).toContainText('Created by Playwright')
  })

  test('views a repr detail page', async ({ page }) => {
    const title = `E2E View ${uniqueSuffix()}`
    await createRepr(page, { title })
    await openReprFromHome(page, title)
    await expect(
      page.locator('.card-title').filter({ hasText: 'View Repr' })
    ).toBeVisible()
  })

  test('filters reprs by title text and category tags', async ({ page }) => {
    const runId = uniqueSuffix()
    const tag = `e2e-tag-${runId}`
    const visibleTitle = `E2E Filter Visible ${runId}`
    const hiddenTitle = `E2E Filter Hidden ${runId}`

    await goToAuthenticatedHome(page)
    await resetHomeFilters(page)
    await ensureReprHeadroom(page, 2)

    await createRepr(page, {
      title: visibleTitle,
      categories: [tag],
    })
    await createRepr(page, { title: hiddenTitle, categories: ['other-e2e'] })

    await expect(reprCard(page, visibleTitle)).toBeVisible({ timeout: 30_000 })
    await expect(reprCard(page, hiddenTitle)).toBeVisible({ timeout: 30_000 })

    await filterReprsByText(page, `Visible ${runId}`)
    await expect(reprCard(page, visibleTitle)).toBeVisible({ timeout: 30_000 })
    await expect(reprCard(page, hiddenTitle)).not.toBeVisible({
      timeout: 10_000,
    })

    await page.locator('#category-filter-text-input').fill('')
    await filterReprsByCategory(page, tag)
    await expect(reprCard(page, visibleTitle)).toBeVisible({ timeout: 30_000 })
    await expect(reprCard(page, hiddenTitle)).not.toBeVisible({
      timeout: 10_000,
    })

    await resetHomeFilters(page)
  })

  test('edits a repr on the view page', async ({ page }) => {
    const title = `E2E Edit ${uniqueSuffix()}`
    const updatedTitle = `${title} Updated`
    await createRepr(page, { title })
    await openReprFromHome(page, title)
    await editReprOnViewPage(page, updatedTitle)
  })

  test('deletes a repr from the view page', async ({ page }) => {
    const title = `E2E Delete ${uniqueSuffix()}`
    await createRepr(page, { title })
    await openReprFromHome(page, title)
    await deleteReprOnViewPage(page)
    await expect(reprCard(page, title)).not.toBeVisible()
  })

  test('marks a repr as practiced', async ({ page }) => {
    const title = `E2E Practiced ${uniqueSuffix()}`
    await createRepr(page, { title })
    await markReprPracticed(page, title)
    const card = reprCard(page, title)
    await expect(card.getByText(/never/i)).not.toBeVisible()
  })
})
