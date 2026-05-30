import { act, screen } from '@testing-library/react'
import React from 'react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
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

describe('ReprLine', () => {
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

      const { unmount } = renderWithAppShell(<ReprLine repr={onCooldown} />, {
        store: store as unknown as TestStore,
        preloadedState: {
          settings: { practiceDelay: 30, warningRatio: 0.5 },
        },
      })

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
