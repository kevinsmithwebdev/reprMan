import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import PasswordFormControl from '..'

const PasswordField = () => {
  const [value, setValue] = useState('secret')
  return (
    <PasswordFormControl
      value={value}
      onChange={(e) => setValue(e.target.value)}
      autoComplete="current-password"
    />
  )
}

describe('PasswordFormControl (integration)', () => {
  it('toggles password visibility', async () => {
    renderWithAppShell(<PasswordField />)
    const input = screen.getByDisplayValue('secret')
    expect(input).toHaveAttribute('type', 'password')

    await userEvent.click(
      screen.getByRole('button', { name: /show password/i })
    )
    expect(screen.getByDisplayValue('secret')).toHaveAttribute('type', 'text')

    await userEvent.click(
      screen.getByRole('button', { name: /hide password/i })
    )
    expect(screen.getByDisplayValue('secret')).toHaveAttribute(
      'type',
      'password'
    )
  })
})
