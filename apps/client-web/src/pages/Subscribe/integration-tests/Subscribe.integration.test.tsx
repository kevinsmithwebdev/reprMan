import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'

import { renderWithAppShell } from '../../../test-utils'
import Subscribe from '../Subscribe'

const mocks = vi.hoisted(() => ({
  isReprsApiConfigured: true,
  homeAuthGateActive: false,
  authState: {
    sessionChecked: true,
    signedIn: true,
    refreshSession: vi.fn(),
  },
  createCheckoutSession: vi.fn<() => Promise<{ url: string }>>(),
  locationAssign: vi.fn(),
}))

vi.mock('@reprman/reprs-api', () => ({
  get isReprsApiConfigured() {
    return mocks.isReprsApiConfigured
  },
  ReprsApiModule: {
    getInstance: () => ({
      createCheckoutSession: mocks.createCheckoutSession,
    }),
  },
}))

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return {
    ...actual,
    homeAuthGateActive: () => mocks.homeAuthGateActive,
  }
})

vi.mock('@reprman/cognito-auth/CognitoAuthContext', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/CognitoAuthContext')
  >()
  return {
    ...actual,
    useCognitoAuth: () => mocks.authState,
  }
})

vi.mock('@reprman/localization', () => ({
  useL10n: () => ({
    t: (key: string) => key,
  }),
}))

describe('Subscribe (integration)', () => {
  beforeEach(() => {
    mocks.isReprsApiConfigured = true
    mocks.homeAuthGateActive = false
    mocks.authState = {
      sessionChecked: true,
      signedIn: true,
      refreshSession: vi.fn(),
    }
    mocks.createCheckoutSession.mockReset()
    mocks.locationAssign.mockReset()
    vi.stubGlobal('location', { assign: mocks.locationAssign })
  })

  it('redirects to sign-in when auth gate is active and user is signed out', () => {
    mocks.homeAuthGateActive = true
    mocks.authState = {
      sessionChecked: true,
      signedIn: false,
      refreshSession: vi.fn(),
    }

    renderWithAppShell(
      <Routes>
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/signin" element={<div id="SignIn-page" />} />
      </Routes>,
      { initialEntries: ['/subscribe'] }
    )

    expect(document.getElementById('SignIn-page')).toBeTruthy()
  })

  it('shows unavailable error when reprs API is not configured', async () => {
    mocks.isReprsApiConfigured = false
    renderWithAppShell(<Subscribe />, { initialEntries: ['/subscribe'] })

    userEvent.click(screen.getByRole('button', { name: 'billing.subscribe' }))

    expect(screen.getByText('billing.checkoutUnavailable')).toBeTruthy()
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled()
  })

  it('shows spinner while checkout request is pending and redirects on success', async () => {
    let resolveCheckout: ((value: { url: string }) => void) | undefined
    const checkoutPromise = new Promise<{ url: string }>((resolve) => {
      resolveCheckout = resolve
    })
    mocks.createCheckoutSession.mockReturnValue(checkoutPromise)

    renderWithAppShell(<Subscribe />, { initialEntries: ['/subscribe'] })
    const subscribeButton = screen.getByRole('button', {
      name: 'billing.subscribe',
    })

    userEvent.click(subscribeButton)

    expect(subscribeButton).toBeDisabled()
    expect(document.querySelector('.spinner-border')).toBeTruthy()

    resolveCheckout?.({ url: 'https://example.test/checkout' })

    await waitFor(() => {
      expect(mocks.locationAssign).toHaveBeenCalledWith(
        'https://example.test/checkout'
      )
    })
  })

  it('shows failed checkout error and resets busy state', async () => {
    mocks.createCheckoutSession.mockRejectedValue(new Error('checkout failed'))
    renderWithAppShell(<Subscribe />, { initialEntries: ['/subscribe'] })
    const subscribeButton = screen.getByRole('button', {
      name: 'billing.subscribe',
    })

    userEvent.click(subscribeButton)

    await waitFor(() => {
      expect(screen.getByText('billing.checkoutFailed')).toBeTruthy()
      expect(subscribeButton).not.toBeDisabled()
    })
  })
})
