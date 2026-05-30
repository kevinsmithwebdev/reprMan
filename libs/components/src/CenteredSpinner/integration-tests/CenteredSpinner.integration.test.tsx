import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import CenteredSpinner from '..'

describe('CenteredSpinner (integration)', () => {
  it('renders section layout by default', () => {
    renderWithAppShell(<CenteredSpinner id="spinner-test" />)
    const el = document.getElementById('spinner-test')
    expect(el).toBeTruthy()
    expect(el?.className).toContain('py-5')
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('renders fill layout', () => {
    renderWithAppShell(<CenteredSpinner layout="fill" />)
    expect(screen.getByRole('status').parentElement?.className).toContain(
      'flex-grow-1'
    )
  })
})
