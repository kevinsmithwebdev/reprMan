import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { ToastLevel } from '@reprman/types'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import AcceptTermsGate from '..'

const acceptTerms = vi.fn().mockResolvedValue({
  termsAcceptedAt: '2026-01-01T00:00:00Z',
  termsVersion: '1',
  currentTermsVersion: '1',
})

vi.mock('@reprman/reprs-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reprman/reprs-api')>()
  return {
    ...actual,
    isReprsApiConfigured: true,
    ReprsApiModule: {
      getInstance: () => ({ acceptTerms }),
    },
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

describe('AcceptTermsGate (integration)', () => {
  beforeEach(() => {
    acceptTerms.mockClear()
  })

  it('shows modal and accepts terms', async () => {
    renderWithAppShell(<AcceptTermsGate />, {
      preloadedState: {
        reprsQuota: {
          maxReprsAllowed: 25,
          termsVersion: null,
          currentTermsVersion: '1',
        },
        user: {
          email: 'user@example.com',
          userId: 'user-1',
        },
      },
      initialEntries: ['/'],
    })

    expect(screen.getByRole('dialog')).toBeTruthy()

    await userEvent.click(screen.getByRole('checkbox'))
    const submit = screen.getByRole('button', { name: /accept/i })
    expect(submit).not.toBeDisabled()
    await userEvent.click(submit)

    expect(acceptTerms).toHaveBeenCalledWith('1')
  })

  it('shows a toast when accept terms fails', async () => {
    acceptTerms.mockRejectedValueOnce(new Error('network'))

    const { store } = renderWithAppShell(<AcceptTermsGate />, {
      preloadedState: {
        reprsQuota: {
          maxReprsAllowed: 25,
          termsVersion: null,
          currentTermsVersion: '1',
        },
        user: {
          email: 'user@example.com',
          userId: 'user-1',
        },
      },
      initialEntries: ['/'],
    })
    const dispatchSpy = vi.spyOn(store, 'dispatch')

    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /accept/i }))

    expect(dispatchSpy).toHaveBeenCalledWith(
      makeToastSAC({
        body: 'Could not record your acceptance. Check your connection and try again.',
        level: ToastLevel.FAIL,
        delay: 8000,
      })
    )
    dispatchSpy.mockRestore()
  })

  it('does not show the modal on the terms route', () => {
    renderWithAppShell(<AcceptTermsGate />, {
      preloadedState: {
        reprsQuota: {
          maxReprsAllowed: 25,
          termsVersion: null,
          currentTermsVersion: '1',
        },
        user: {
          email: 'user@example.com',
          userId: 'user-1',
        },
      },
      initialEntries: ['/terms'],
    })

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(acceptTerms).not.toHaveBeenCalled()
  })
})
