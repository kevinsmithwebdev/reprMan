import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import ChangePassword from '../ChangePassword'

const changePasswordState = {
  oldPassword: 'oldpass1',
  setOldPassword: vi.fn(),
  newPassword: 'newpass1',
  setNewPassword: vi.fn(),
  confirmPassword: 'newpass1',
  setConfirmPassword: vi.fn(),
  busy: false,
  handleSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
}

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return { ...actual, isCognitoConfigured: () => true }
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

vi.mock('@reprman/cognito-auth/useCognitoChangePassword', () => ({
  useCognitoChangePassword: () => ({
    ...changePasswordState,
    t: (key: string) => key,
  }),
}))

describe('ChangePassword (integration)', () => {
  it('renders change password form and submits', async () => {
    changePasswordState.busy = false
    changePasswordState.handleSubmit.mockClear()
    renderWithAppShell(<ChangePassword />, {
      initialEntries: ['/change-password'],
    })
    expect(document.getElementById('ChangePassword-page')).toBeTruthy()
    await userEvent.click(
      screen.getByRole('button', { name: /changePasswordSubmit/i })
    )
    expect(changePasswordState.handleSubmit).toHaveBeenCalled()
  })

  it('calls password field setters on change', async () => {
    changePasswordState.setOldPassword.mockClear()
    changePasswordState.setNewPassword.mockClear()
    changePasswordState.setConfirmPassword.mockClear()
    renderWithAppShell(<ChangePassword />, {
      initialEntries: ['/change-password'],
    })

    await userEvent.type(screen.getByLabelText(/changePasswordCurrent/i), 'x')
    await userEvent.type(screen.getByLabelText(/changePasswordNew/i), 'y')
    await userEvent.type(screen.getByLabelText(/confirmPassword/i), 'z')
    expect(changePasswordState.setOldPassword).toHaveBeenCalled()
    expect(changePasswordState.setNewPassword).toHaveBeenCalled()
    expect(changePasswordState.setConfirmPassword).toHaveBeenCalled()
  })

  it('shows spinner when busy', () => {
    changePasswordState.busy = true
    renderWithAppShell(<ChangePassword />, {
      initialEntries: ['/change-password'],
    })
    expect(screen.getByRole('status')).toBeTruthy()
    changePasswordState.busy = false
  })
})
