import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import ChangePassword from '../ChangePassword'

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return { ...actual, isCognitoConfigured: () => false }
})

describe('ChangePassword unconfigured (integration)', () => {
  it('shows auth unavailable card', () => {
    renderWithAppShell(<ChangePassword />, {
      initialEntries: ['/change-password'],
    })
    expect(document.getElementById('ChangePassword-page')).toBeTruthy()
    expect(screen.getByRole('link', { name: /home/i })).toBeTruthy()
  })
})
