import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import moment from 'moment'

import type { Repr } from '@reprman/types'
import store from '@reprman/state/store'
import type { TestStore } from '../../../../../apps/client-web/src/test-utils/createTestStore'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import ReprLine from '..'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../../../apps/client-web/src/test-utils/createTestStore'
  )
  return { default: createTestStore() }
})

const repr: Repr = {
  id: 'line-1',
  title: 'Practice me',
  categories: ['music'],
  dateCreated: 0,
  datesPracticed: [moment().subtract(2, 'days').valueOf()],
  comment: 'A note',
  learning: false,
}

describe('ReprLine (integration)', () => {
  it('renders repr details and practice button', () => {
    renderWithAppShell(<ReprLine repr={repr} />, {
      store: store as unknown as TestStore,
      preloadedState: {
        settings: { practiceDelay: 30, warningRatio: 0.5 },
      },
    })

    expect(screen.getByText('Practice me')).toBeTruthy()
    expect(screen.getByText(/A note/)).toBeTruthy()
    expect(screen.getByText('music')).toBeTruthy()
    expect(screen.getByRole('button', { name: /practiced/i })).toBeTruthy()
  })
})
