import { expect, test } from '@playwright/test'

import { uniqueSuffix } from '../helpers/env'
import { createRepr, reprCard } from '../helpers/repr'
import {
  copyReportToClipboard,
  expectReprInReport,
  filterReportByLabel,
  openReportsPage,
} from '../helpers/reports'

test.describe('reports', () => {
  test('builds a filtered report and copies it to the clipboard', async ({
    page,
  }) => {
    const label = `e2e-report-${uniqueSuffix()}`
    const title = `E2E Report ${uniqueSuffix()}`

    await createRepr(page, {
      title,
      categories: [label],
      comment: 'Report line',
    })
    await expect(reprCard(page, title)).toBeVisible({ timeout: 30_000 })
    await openReportsPage(page)
    await filterReportByLabel(page, label)
    await expectReprInReport(page, title)
    await page.locator('#reports-include-labels').check()
    await copyReportToClipboard(page, { includeLabels: true })

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    )
    expect(clipboardText).toContain(title)
    expect(clipboardText).toContain(label)
  })
})
