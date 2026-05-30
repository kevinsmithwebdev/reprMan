import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import AuthUnavailableCard from '..'

describe('AuthUnavailableCard (integration)', () => {
  it('renders title, message, and home link', () => {
    renderWithAppShell(
      <AuthUnavailableCard
        pageId="SignIn-page"
        titleKey="pages.signin.title"
        messageKey="auth.cognitoUnavailable"
      />
    )
    expect(document.getElementById('SignIn-page')).toBeTruthy()
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute(
      'href',
      '/'
    )
  })
})
