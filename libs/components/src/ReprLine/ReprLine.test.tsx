import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import moment from 'moment'
import type { Repr } from '@reprman/types'
import { PRACTICE_COOLDOWN_MS } from '@reprman/shared/repr-rules'

import type { TestStore } from '../../../../apps/client-web/src/test-utils/createTestStore'
import { renderWithAppShell } from '../../../../apps/client-web/src/test-utils'
import store from '@reprman/state/store'
import ReprLine from './ReprLine'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../../apps/client-web/src/test-utils/createTestStore'
  )
  return { default: createTestStore() }
})

const repr: Repr = {
  id: 'line-1',
  title: 'Cooldown piece',
  categories: [],
  dateCreated: 0,
  datesPracticed: [],
  comment: '',
  learning: false,
}

const renderOptions = {
  store: store as unknown as TestStore,
  preloadedState: {
    settings: { practiceDelay: 30, warningRatio: 0.5 },
  },
}

describe('ReprLine', () => {
  it('shows never when the repr has not been practiced', () => {
    renderWithAppShell(<ReprLine repr={repr} />, renderOptions)

    expect(screen.getByText(/Last Practiced:/)).toBeTruthy()
    expect(screen.getByText('never')).toBeTruthy()
  })

  it('navigates to the view repr route when the card is clicked', async () => {
    renderWithAppShell(
      <Routes>
        <Route path="/" element={<ReprLine repr={repr} />} />
        <Route path="/view/:id" element={<div>view page</div>} />
      </Routes>,
      renderOptions
    )

    await userEvent.click(screen.getByText('Cooldown piece'))
    expect(screen.getByText('view page')).toBeTruthy()
  })

  describe('practice cooldown effect', () => {
    beforeAll(() => {
      vi.useFakeTimers()
    })

    afterAll(() => {
      vi.useRealTimers()
    })

    it('schedules a re-render when practice is on cooldown', async () => {
      const now = 1_000_000
      vi.setSystemTime(now)
      const lastPracticed = now - 30_000
      const onCooldown = {
        ...repr,
        datesPracticed: [lastPracticed],
      }
      const setTimeoutSpy = vi.spyOn(globalThis.window, 'setTimeout')
      const clearTimeoutSpy = vi.spyOn(globalThis.window, 'clearTimeout')

      const { unmount } = renderWithAppShell(
        <ReprLine repr={onCooldown} />,
        renderOptions
      )

      expect(setTimeoutSpy).toHaveBeenCalledWith(
        expect.any(Function),
        PRACTICE_COOLDOWN_MS - (Date.now() - lastPracticed)
      )

      await act(async () => {
        vi.advanceTimersByTime(
          PRACTICE_COOLDOWN_MS - (Date.now() - lastPracticed) + 1
        )
      })

      unmount()
      expect(clearTimeoutSpy).toHaveBeenCalled()
      setTimeoutSpy.mockRestore()
      clearTimeoutSpy.mockRestore()
    })
  })
})
