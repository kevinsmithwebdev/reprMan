import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'

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

  it('navigates to the sign-in route', async () => {
    renderWithAppShell(
      <Routes>
        <Route path="/" element={<HomeAuthCard authReady />} />
        <Route path="/signin" element={<div>signin page</div>} />
      </Routes>,
      { initialEntries: ['/'] }
    )

    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(screen.getByText('signin page')).toBeTruthy()
  })

  it('navigates to the sign-up route', async () => {
    renderWithAppShell(
      <Routes>
        <Route path="/" element={<HomeAuthCard authReady />} />
        <Route path="/signup" element={<div>signup page</div>} />
      </Routes>,
      { initialEntries: ['/'] }
    )

    await userEvent.click(screen.getByRole('button', { name: /^sign up$/i }))
    expect(screen.getByText('signup page')).toBeTruthy()
  })
})
