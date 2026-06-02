import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '@client-web/test-utils'
import ControlsHome from '../ControlsHome'

describe('ControlsHome (integration)', () => {
  it('shows repr count and filter controls', () => {
    renderWithAppShell(<ControlsHome />, {
      preloadedState: {
        reprs: [
          {
            id: 'r1',
            title: 'Piece',
            categories: ['music'],
            dateCreated: 0,
            datesPracticed: [],
            comment: '',
            learning: false,
          },
        ],
        categories: {
          categories: ['music'],
          filter: { text: '', categories: [] },
        },
      },
    })

    expect(document.getElementById('controls-home-component')).toBeTruthy()
    expect(screen.getByText(/1/)).toBeTruthy()
  })

  it('shows filter badge when text and category filters are active', async () => {
    renderWithAppShell(<ControlsHome />, {
      preloadedState: {
        reprs: [],
        categories: {
          categories: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
          filter: {
            text: 'query',
            categories: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
          },
        },
      },
    })

    expect(screen.getByText('9+')).toBeTruthy()
  })
})
