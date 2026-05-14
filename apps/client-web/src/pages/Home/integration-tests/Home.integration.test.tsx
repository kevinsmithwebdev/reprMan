import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import Home from '../Home'

describe('Home (integration)', () => {
  it('renders empty repr list when data is loaded and list is empty', () => {
    renderWithAppShell(<Home />, {
      preloadedState: {
        reprs: [],
      },
    })

    expect(screen.getByRole('status')).toHaveTextContent('No reprs were found')
    expect(document.getElementById('Home-page')).toBeTruthy()
  })
})
