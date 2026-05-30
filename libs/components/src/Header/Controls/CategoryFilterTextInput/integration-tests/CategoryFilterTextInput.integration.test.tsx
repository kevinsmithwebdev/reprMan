import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { TestStore } from '../../../../../../../apps/client-web/src/test-utils/createTestStore'
import { renderWithAppShell } from '../../../../../../../apps/client-web/src/test-utils'
import store from '@reprman/state/store'
import CategoryFilterTextInput from '..'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../../../../../apps/client-web/src/test-utils/createTestStore'
  )
  return {
    default: createTestStore({
      categories: {
        categories: ['music'],
        filter: { text: '', categories: [] },
      },
    }),
  }
})

describe('CategoryFilterTextInput (integration)', () => {
  it('updates category filter text', async () => {
    const testStore = store as unknown as TestStore
    renderWithAppShell(<CategoryFilterTextInput />, { store: testStore })

    await userEvent.type(
      screen.getByLabelText('Filter reprs by title or comment'),
      'violin'
    )
    expect(testStore.getState().categories.filter.text).toBe('violin')
  })
})
