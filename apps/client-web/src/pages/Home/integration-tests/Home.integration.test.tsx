import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import { loadedAppState, testRepr } from '../../../test-utils/fixtures'
import Home from '../Home'

describe('Home (integration)', () => {
  it('renders empty repr list when data is loaded and list is empty', () => {
    renderWithAppShell(<Home />, {
      preloadedState: loadedAppState([]),
    })

    expect(screen.getByRole('status')).toHaveTextContent('No reprs were found')
    expect(document.getElementById('Home-page')).toBeTruthy()
  })

  it('renders repr list when data is loaded', () => {
    renderWithAppShell(<Home />, {
      preloadedState: loadedAppState([testRepr({ title: 'My repr' })]),
    })

    expect(screen.getByText('My repr')).toBeTruthy()
    expect(document.getElementById('Home-page')).toBeTruthy()
  })

  it('shows loading spinner while reprs are not loaded', () => {
    renderWithAppShell(<Home />)

    expect(document.getElementById('Home-page')).toBeTruthy()
    expect(screen.getByRole('status')).toBeTruthy()
  })
})
