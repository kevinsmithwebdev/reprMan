import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'
import moment from 'moment'

import type { Repr } from '@reprman/types'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import ReprsList from '..'

const repr = (overrides: Partial<Repr> = {}): Repr => ({
  id: '1',
  title: 'Sample',
  categories: [],
  dateCreated: 0,
  datesPracticed: [moment().valueOf()],
  comment: '',
  learning: false,
  ...overrides,
})

describe('ReprsList (integration)', () => {
  it('shows empty message when there are no reprs', () => {
    renderWithAppShell(<ReprsList reprs={[]} />)
    expect(screen.getByRole('status')).toHaveTextContent('No reprs were found')
    expect(document.getElementById('reprs-list-component')).toBeTruthy()
  })

  it('renders sections when reprs exist', () => {
    renderWithAppShell(
      <ReprsList reprs={[repr({ id: 'a', title: 'Alpha' })]} />,
      {
        preloadedState: {
          settings: { practiceDelay: 30, warningRatio: 0.5 },
        },
      }
    )
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(document.querySelector('[data-row-id="a"]')).toBeTruthy()
  })
})
