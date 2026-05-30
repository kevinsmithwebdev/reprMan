import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import TermsLink from '..'

describe('TermsLink (integration)', () => {
  it('opens terms modal when clicked', async () => {
    renderWithAppShell(<TermsLink>View terms</TermsLink>)
    await userEvent.click(screen.getByRole('button', { name: /view terms/i }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Purpose')).toBeTruthy()
  })
})
