import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import SettingsCardNumber from '../SettingsCardNumber/SettingsCardNumber'

const SettingsCardNumberHarness = () => {
  const [value, setValue] = useState(30)
  return (
    <SettingsCardNumber
      value={value}
      onChange={(e) => setValue(+e.target.value)}
      subtitle="Delay"
      text="Days before overdue"
      step={1}
    />
  )
}

describe('SettingsCardNumber (integration)', () => {
  it('updates numeric value on change', async () => {
    renderWithAppShell(<SettingsCardNumberHarness />)
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '21')
    expect(input).toHaveValue(21)
  })
})
