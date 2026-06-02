import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { testRepr } from '../../../../../apps/client-web/src/test-utils/fixtures'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import ReprLimitBanner from '..'

vi.mock('@reprman/reprs-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reprman/reprs-api')>()
  return {
    ...actual,
    isReprsApiConfigured: true,
  }
})

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return {
    ...actual,
    homeAuthGateActive: () => false,
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
      signedIn: true,
      refreshSession: vi.fn(),
    }),
  }
})

const atLimitState = {
  reprs: [testRepr({ id: 'r1' }), testRepr({ id: 'r2' })],
  reprsQuota: {
    subscription: {
      status: 'unpaid' as const,
      expiration: null,
      maxReprs: 2,
    },
    maxReprsAllowed: 2,
  },
}

describe('ReprLimitBanner (integration)', () => {
  it('shows the limit warning when the user is at the repr cap', () => {
    renderWithAppShell(<ReprLimitBanner />, {
      preloadedState: atLimitState,
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Repr limit of 2 reached.'
    )
    expect(document.getElementById('repr-limit-banner')).toBeTruthy()
  })

  it('renders nothing when below the repr cap', () => {
    renderWithAppShell(<ReprLimitBanner />, {
      preloadedState: {
        ...atLimitState,
        reprs: [testRepr({ id: 'r1' })],
      },
    })

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('renders nothing when maxReprs is unlimited (null)', () => {
    renderWithAppShell(<ReprLimitBanner />, {
      preloadedState: {
        reprs: [testRepr(), testRepr({ id: 'r2' })],
        reprsQuota: {
          subscription: {
            status: 'unlimited',
            expiration: null,
            maxReprs: null,
          },
          maxReprsAllowed: null,
        },
      },
    })

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('renders nothing when subscription is not loaded', () => {
    renderWithAppShell(<ReprLimitBanner />, {
      preloadedState: {
        reprs: atLimitState.reprs,
        reprsQuota: { maxReprsAllowed: 2 },
      },
    })

    expect(screen.queryByRole('alert')).toBeNull()
  })
})
