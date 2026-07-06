import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import {
  navigationMocks,
  renderWithAppShell,
} from '../../../../../apps/client-web/src/test-utils'
import SubscriptionHeaderStatus from '..'

const mocks = vi.hoisted(() => ({
  daysUntilExpiration: 7,
  shouldShowPaidExpiryWarning: false,
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

vi.mock('@reprman/shared/subscription', () => ({
  daysUntilExpiration: () => mocks.daysUntilExpiration,
  shouldShowPaidExpiryWarning: () => mocks.shouldShowPaidExpiryWarning,
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
    t: (key: string, opts?: { count?: number }) =>
      opts?.count === undefined ? key : `${key}:${opts.count}`,
  }),
}))

describe('SubscriptionHeaderStatus (integration)', () => {
  beforeEach(() => {
    mocks.daysUntilExpiration = 7
    mocks.shouldShowPaidExpiryWarning = false
    mocks.isReprsApiConfigured = true
    mocks.homeAuthGateActive = false
    mocks.authState = {
      sessionChecked: true,
      signedIn: true,
      refreshSession: vi.fn(),
    }
    mocks.createCheckoutSession.mockReset()
    navigationMocks.push.mockReset()
    mocks.locationAssign.mockReset()
    vi.stubGlobal('location', { assign: mocks.locationAssign })
  })

  it('renders nothing when subscription is not loaded', () => {
    renderWithAppShell(<SubscriptionHeaderStatus />, {
      preloadedState: {
        reprsQuota: {
          maxReprsAllowed: 10,
        },
      },
    })

    expect(document.getElementById('subscription-header-status')).toBeNull()
  })

  it('renders trial days with singular label', () => {
    mocks.daysUntilExpiration = 1
    renderWithAppShell(<SubscriptionHeaderStatus />, {
      preloadedState: {
        reprsQuota: {
          subscription: {
            status: 'trial',
            expiration: '2099-01-01T00:00:00.000Z',
            maxReprs: 10,
          },
        },
      },
    })

    expect(screen.getByText('billing.header.trialOne:1')).toBeTruthy()
  })

  it('renders unpaid status and redirects to checkout URL on subscribe click', async () => {
    mocks.createCheckoutSession.mockResolvedValue({
      url: 'https://example.test/checkout',
    })
    renderWithAppShell(<SubscriptionHeaderStatus />, {
      preloadedState: {
        reprsQuota: {
          subscription: {
            status: 'unpaid',
            expiration: null,
            maxReprs: 2,
          },
        },
      },
    })

    expect(screen.getByText('billing.header.unpaid')).toBeTruthy()

    userEvent.click(screen.getByRole('button', { name: 'billing.subscribe' }))

    await waitFor(() => {
      expect(mocks.createCheckoutSession).toHaveBeenCalledOnce()
      expect(mocks.locationAssign).toHaveBeenCalledWith(
        'https://example.test/checkout'
      )
    })
  })

  it('falls back to /subscribe when checkout API fails', async () => {
    mocks.createCheckoutSession.mockRejectedValue(new Error('checkout failed'))
    renderWithAppShell(<SubscriptionHeaderStatus />, {
      preloadedState: {
        reprsQuota: {
          subscription: {
            status: 'unpaid',
            expiration: null,
            maxReprs: 2,
          },
        },
      },
    })

    await userEvent.click(
      screen.getByRole('button', { name: 'billing.subscribe' })
    )

    await waitFor(() => {
      expect(navigationMocks.push).toHaveBeenCalledWith('/subscribe')
    })
  })

  it('renders paid expiration warning with plural day label', () => {
    mocks.daysUntilExpiration = 3
    mocks.shouldShowPaidExpiryWarning = true
    renderWithAppShell(<SubscriptionHeaderStatus />, {
      preloadedState: {
        reprsQuota: {
          subscription: {
            status: 'paid',
            expiration: '2099-01-01T00:00:00.000Z',
            maxReprs: 10,
          },
        },
      },
    })

    expect(screen.getByText('billing.header.expiringOther:3')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'billing.subscribe' })
    ).toBeTruthy()
  })

  it('renders nothing when auth gate is active and user is signed out', () => {
    mocks.homeAuthGateActive = true
    mocks.authState = {
      sessionChecked: true,
      signedIn: false,
      refreshSession: vi.fn(),
    }
    renderWithAppShell(<SubscriptionHeaderStatus />, {
      preloadedState: {
        reprsQuota: {
          subscription: {
            status: 'unpaid',
            expiration: null,
            maxReprs: 2,
          },
        },
      },
    })

    expect(document.getElementById('subscription-header-status')).toBeNull()
  })
})
