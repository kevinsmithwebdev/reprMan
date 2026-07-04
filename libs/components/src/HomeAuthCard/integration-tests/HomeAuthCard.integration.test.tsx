import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it } from 'vitest'

import {
  navigationMocks,
  renderWithAppShell,
} from '../../../../../apps/client-web/src/test-utils'
import HomeAuthCard from '..'

describe('HomeAuthCard (integration)', () => {
  it('shows setup warning when auth is not ready', () => {
    renderWithAppShell(<HomeAuthCard authReady={false} />)
    expect(screen.getByRole('link', { name: /^sign in$/i })).toBeTruthy()
    expect(screen.getByRole('alert')).toBeTruthy()
  })

  it('renders sign-up when auth is ready', () => {
    renderWithAppShell(<HomeAuthCard authReady />)
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('link', { name: /^sign up$/i })).toBeTruthy()
  })

  it('navigates to the sign-in route', async () => {
    navigationMocks.push.mockClear()
    renderWithAppShell(<HomeAuthCard authReady />)

    await userEvent.click(screen.getByRole('link', { name: /^sign in$/i }))
    expect(navigationMocks.push).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: /^sign in$/i })).toHaveAttribute(
      'href',
      '/signin'
    )
  })

  it('navigates to the sign-up route', async () => {
    renderWithAppShell(<HomeAuthCard authReady />)

    expect(screen.getByRole('link', { name: /^sign up$/i })).toHaveAttribute(
      'href',
      '/signup'
    )
  })
})
