import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { TestStore } from '../../../../../../../apps/client-web/src/test-utils/createTestStore'
import { renderWithAppShell } from '../../../../../../../apps/client-web/src/test-utils'
import store from '@reprman/state/store'
import FilterForm from '..'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../../../../../apps/client-web/src/test-utils/createTestStore'
  )
  return {
    default: createTestStore({
      categories: {
        categories: ['alpha', 'beta'],
        filter: { text: '', categories: [] },
      },
    }),
  }
})

describe('FilterForm (integration)', () => {
  it('toggles category filter checkboxes', async () => {
    const testStore = store as unknown as TestStore
    renderWithAppShell(<FilterForm />, { store: testStore })

    await userEvent.click(screen.getByLabelText('alpha'))
    expect(testStore.getState().categories.filter.categories).toEqual(['alpha'])

    await userEvent.click(screen.getByLabelText('alpha'))
    expect(testStore.getState().categories.filter.categories).toEqual([])
  })
})
