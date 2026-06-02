import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import TermsContent from '..'

describe('TermsContent (integration)', () => {
  it('renders all terms sections', () => {
    renderWithAppShell(<TermsContent />)
    expect(screen.getByText('Purpose')).toBeTruthy()
    expect(screen.getByText('Agreement')).toBeTruthy()
    expect(document.querySelectorAll('hr').length).toBe(5)
  })
})
