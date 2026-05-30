import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import About from '../About'

describe('About (integration)', () => {
  it('renders about sections and suggestions', () => {
    renderWithAppShell(<About />, { initialEntries: ['/about'] })
    expect(document.getElementById('About-page')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'repr.jpg' })).toBeTruthy()
    expect(screen.getByText(/accounts/i)).toBeTruthy()
    expect(screen.getByText(/kevinsmithwebdev@gmail.com/)).toBeTruthy()
  })
})
