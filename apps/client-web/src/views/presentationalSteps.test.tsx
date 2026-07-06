import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../test-utils'
import ForgotPasswordConfirmStep from './ForgotPassword/ForgotPasswordConfirmStep'
import ForgotPasswordRequestStep from './ForgotPassword/ForgotPasswordRequestStep'
import ReportsControls from './Reports/ReportsControls'
import SettingsCardNumber from './Settings/SettingsCardNumber'
import SupplementalSettingsCard from './Settings/SupplementalSettingsCard'
import SignupConfirmStep from './Signup/SignupConfirmStep'
import SignupRegisterStep from './Signup/SignupRegisterStep'

describe('presentational view steps', () => {
  it('renders forgot-password request step and submits email', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    const setEmail = vi.fn()

    renderWithAppShell(
      <ForgotPasswordRequestStep
        email="a@b.com"
        setEmail={setEmail}
        busy={false}
        onSubmit={onSubmit}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: /Send reset code/i })
    )
    expect(onSubmit).toHaveBeenCalled()
  })

  it('renders forgot-password confirm step callbacks', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    const onResend = vi.fn()
    const onEditEmail = vi.fn()

    renderWithAppShell(
      <ForgotPasswordConfirmStep
        email="a@b.com"
        code="123456"
        setCode={vi.fn()}
        newPassword="password1"
        setNewPassword={vi.fn()}
        confirmPassword="password1"
        setConfirmPassword={vi.fn()}
        busy={false}
        onSubmit={onSubmit}
        onResend={onResend}
        onEditEmail={onEditEmail}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: /Set new password/i })
    )
    expect(onSubmit).toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: /Resend code/i }))
    expect(onResend).toHaveBeenCalled()
    await userEvent.click(screen.getByText(/Use a different email/i))
    expect(onEditEmail).toHaveBeenCalled()
  })

  it('renders signup register step with terms gate', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault())

    renderWithAppShell(
      <SignupRegisterStep
        email="a@b.com"
        setEmail={vi.fn()}
        password="password1"
        setPassword={vi.fn()}
        confirmPassword="password1"
        setConfirmPassword={vi.fn()}
        acceptedTerms
        setAcceptedTerms={vi.fn()}
        busy={false}
        onSubmit={onSubmit}
      />
    )

    const submit = screen.getByRole('button', { name: /Create account/i })
    expect(submit).not.toBeDisabled()
    await userEvent.click(submit)
    expect(onSubmit).toHaveBeenCalled()
  })

  it('renders signup confirm step callbacks', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    const onResend = vi.fn()
    const onEditEmail = vi.fn()

    renderWithAppShell(
      <SignupConfirmStep
        email="a@b.com"
        code="123456"
        setCode={vi.fn()}
        busy={false}
        onSubmit={onSubmit}
        onResend={onResend}
        onEditEmail={onEditEmail}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: /Confirm and sign in/i })
    )
    expect(onSubmit).toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: /Resend code/i }))
    expect(onResend).toHaveBeenCalled()
    await userEvent.click(screen.getByText(/Use a different email/i))
    expect(onEditEmail).toHaveBeenCalled()
  })

  it('renders reports controls and invokes callbacks', async () => {
    const onToggleLabel = vi.fn()
    const onIncludeCommentsChange = vi.fn()
    const onIncludeLabelsChange = vi.fn()
    const onCopy = vi.fn()

    renderWithAppShell(
      <ReportsControls
        allCategories={['music']}
        selectedLabels={[]}
        onToggleLabel={onToggleLabel}
        includeComments={false}
        onIncludeCommentsChange={onIncludeCommentsChange}
        includeLabels={false}
        onIncludeLabelsChange={onIncludeLabelsChange}
        onCopy={onCopy}
      />
    )

    await userEvent.click(screen.getByLabelText('music'))
    expect(onToggleLabel).toHaveBeenCalledWith('music')
    await userEvent.click(screen.getByLabelText(/Comments/i))
    expect(onIncludeCommentsChange).toHaveBeenCalledWith(true)
    await userEvent.click(screen.getByLabelText(/Labels/i))
    expect(onIncludeLabelsChange).toHaveBeenCalledWith(true)
    await userEvent.click(
      screen.getByRole('button', { name: /Copy list to clipboard/i })
    )
    expect(onCopy).toHaveBeenCalled()
  })

  it('shows em dash when reports have no categories', () => {
    renderWithAppShell(
      <ReportsControls
        allCategories={[]}
        selectedLabels={[]}
        onToggleLabel={vi.fn()}
        includeComments={false}
        onIncludeCommentsChange={vi.fn()}
        includeLabels={false}
        onIncludeLabelsChange={vi.fn()}
        onCopy={vi.fn()}
      />
    )

    expect(screen.getByText('—')).toBeTruthy()
  })

  it('renders settings cards and handles input/button actions', async () => {
    const onChange = vi.fn()
    const onClick = vi.fn()

    renderWithAppShell(
      <>
        <SettingsCardNumber
          value={30}
          onChange={onChange}
          subtitle="subtitle"
          text="text"
        />
        <SupplementalSettingsCard
          title="Reset"
          subtitle="subtitle"
          buttons={[{ text: 'Go', variant: 'warning', onClick }]}
          info="info-key"
        />
      </>
    )

    await userEvent.clear(screen.getByRole('spinbutton'))
    await userEvent.type(screen.getByRole('spinbutton'), '45')
    expect(onChange).toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalled()
  })
})
