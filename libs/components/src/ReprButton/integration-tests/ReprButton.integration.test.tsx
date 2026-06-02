import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import store from '@reprman/state/store'
import type { TestStore } from '../../../../../apps/client-web/src/test-utils/createTestStore'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import ReprButton, { ReprButtonType } from '..'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../../../apps/client-web/src/test-utils/createTestStore'
  )
  return { default: createTestStore() }
})

describe('ReprButton (integration)', () => {
  it('dispatches mark practiced when not disabled', async () => {
    renderWithAppShell(
      <ReprButton type={ReprButtonType.PRACTICED} actionData="repr-1" />,
      { store: store as unknown as TestStore }
    )

    await userEvent.click(screen.getByRole('button', { name: /practiced/i }))

    const actions = (store as unknown as TestStore).getState()
    expect(actions).toBeDefined()
  })

  it('does not dispatch when actionDisabled', async () => {
    const dispatchSpy = vi.spyOn(store as unknown as TestStore, 'dispatch')
    renderWithAppShell(
      <ReprButton
        type={ReprButtonType.PRACTICED}
        actionData="repr-1"
        actionDisabled
      />,
      { store: store as unknown as TestStore }
    )

    await userEvent.click(screen.getByRole('button', { name: /practiced/i }))
    expect(dispatchSpy).not.toHaveBeenCalled()
    dispatchSpy.mockRestore()
  })
})
