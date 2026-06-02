import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import Footer from '..'

describe('Footer (integration)', () => {
  it('renders copyright and contact email', () => {
    renderWithAppShell(<Footer />)
    expect(document.getElementById('footer-component')).toBeTruthy()
    expect(screen.getByText(/kevinsmithwebdev@gmail.com/)).toBeTruthy()
  })
})
