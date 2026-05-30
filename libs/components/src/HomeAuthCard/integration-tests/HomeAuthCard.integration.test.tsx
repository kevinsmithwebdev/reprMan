import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import HomeAuthCard from '..'

describe('HomeAuthCard (integration)', () => {
  it('shows setup warning when auth is not ready', () => {
    renderWithAppShell(<HomeAuthCard authReady={false} />)
    expect(
      screen.getByRole('button', { name: /^sign in$/i })
    ).toBeTruthy()
    expect(screen.getByRole('alert')).toBeTruthy()
  })

  it('renders sign-up when auth is ready', () => {
    renderWithAppShell(<HomeAuthCard authReady />)
    expect(screen.queryByRole('alert')).toBeNull()
    expect(
      screen.getByRole('button', { name: /^sign up$/i })
    ).toBeTruthy()
  })
})
