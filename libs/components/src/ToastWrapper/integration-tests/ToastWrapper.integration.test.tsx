import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ToastLevel } from '@reprman/types'
import type { TestStore } from '../../../../../apps/client-web/src/test-utils/createTestStore'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import store from '@reprman/state/store'
import ToastWrapper from '..'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../../../apps/client-web/src/test-utils/createTestStore'
  )
  return {
    default: createTestStore({
      toasts: [
        {
          id: 'toast-1',
          title: 'Done',
          body: 'Saved successfully',
          level: ToastLevel.SUCCESS,
        },
      ],
    }),
  }
})

describe('ToastWrapper (integration)', () => {
  it('renders toasts from store and dismisses on close', async () => {
    const testStore = store as unknown as TestStore
    renderWithAppShell(<ToastWrapper />, {
      store: testStore,
    })

    expect(screen.getByText('DONE')).toBeTruthy()
    expect(screen.getByText('Saved successfully')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(testStore.getState().toasts).toHaveLength(0)
  })
})
