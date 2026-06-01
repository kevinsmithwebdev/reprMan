import { expect, type Page } from '@playwright/test'

export async function openReportsPage(page: Page): Promise<void> {
  const reportsControls = page.locator('#reports-controls-component')
  if (!(await reportsControls.isVisible().catch(() => false))) {
    await page.getByRole('link', { name: 'Open reports list' }).click()
    await expect(page).toHaveURL(/\/reports/)
  }
  await expect(reportsControls).toBeVisible({ timeout: 60_000 })
}

export async function filterReportByLabel(
  page: Page,
  label: string
): Promise<void> {
  const checkbox = page
    .locator('#reports-controls-component')
    .getByRole('checkbox', { name: label, exact: true })
  await expect(checkbox).toBeVisible({ timeout: 90_000 })
  await checkbox.scrollIntoViewIfNeeded()
  await checkbox.check()
}

export async function expectReprInReport(
  page: Page,
  title: string
): Promise<void> {
  await expect(page.getByText(title, { exact: false }).first()).toBeVisible()
}

export async function copyReportToClipboard(
  page: Page,
  options: { includeLabels?: boolean; includeComments?: boolean } = {}
): Promise<void> {
  if (options.includeComments) {
    await page.locator('#reports-include-comments').check()
  }
  if (options.includeLabels) {
    await page.locator('#reports-include-labels').check()
  }
  await page.getByRole('button', { name: 'Copy list to clipboard' }).click()
  await expect(page.getByText('List copied to clipboard.')).toBeVisible({
    timeout: 10_000,
  })
}
