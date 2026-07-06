import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import Header from '..'

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return {
    ...actual,
    homeAuthGateActive: () => true,
    isCognitoConfigured: () => true,
  }
})

vi.mock('@reprman/cognito-auth/CognitoAuthContext', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/CognitoAuthContext')
  >()
  return {
    ...actual,
    useCognitoAuth: () => ({
      sessionChecked: true,
      signedIn: false,
      refreshSession: vi.fn(),
    }),
  }
})

describe('Header (integration)', () => {
  const originalMatchMedia = globalThis.matchMedia

  beforeEach(() => {
    globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    globalThis.matchMedia = originalMatchMedia
  })

  it('renders brand and nav on home', () => {
    renderWithAppShell(<Header />, { initialEntries: ['/'] })
    expect(document.getElementById('header-component')).toBeTruthy()
    expect(document.getElementById('header-brand')).toBeTruthy()
    expect(screen.getByText(/HOME/i)).toBeTruthy()
  })

  it('appends page title for settings route', () => {
    renderWithAppShell(<Header />, { initialEntries: ['/settings'] })
    expect(document.getElementById('header-brand')?.textContent).toMatch(
      /settings/i
    )
  })

  it('uses narrow brand label on small viewports', () => {
    renderWithAppShell(<Header />, { initialEntries: ['/about'] })
    const brand = document.getElementById('header-brand')
    expect(brand?.textContent).toMatch(/ReprMan/i)
    expect(brand?.textContent).not.toMatch(/Repertoire Management/i)
  })

  it('appends page title for the sign-in route', () => {
    renderWithAppShell(<Header />, { initialEntries: ['/signin'] })
    expect(document.getElementById('header-brand')?.textContent).toMatch(
      /sign in/i
    )
  })

  it('appends page title for the change-password route', () => {
    renderWithAppShell(<Header />, { initialEntries: ['/change-password'] })
    expect(document.getElementById('header-brand')?.textContent).toMatch(
      /change password/i
    )
  })

  it('appends page titles for reports, terms, subscribe, and view routes', () => {
    const cases: Array<[string, RegExp]> = [
      ['/reports', /reports/i],
      ['/terms', /terms/i],
      ['/subscribe', /subscribe/i],
      ['/view/repr-1', /view/i],
      ['/signup', /sign up/i],
      ['/forgot-password', /reset password/i],
    ]

    cases.forEach(([path, pattern]) => {
      const { unmount } = renderWithAppShell(<Header />, {
        initialEntries: [path],
      })
      expect(document.getElementById('header-brand')?.textContent).toMatch(
        pattern
      )
      unmount()
    })
  })

  it('disables settings nav when auth gate is active and user is signed out', () => {
    renderWithAppShell(<Header />, { initialEntries: ['/'] })
    const settingsNav = document.getElementById('nav-link-Settings')
    expect(settingsNav?.querySelector('[aria-disabled="true"]')).toBeTruthy()
  })
})
