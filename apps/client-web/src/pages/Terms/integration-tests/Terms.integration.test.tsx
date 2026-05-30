import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import Terms from '../Terms'

describe('Terms (integration)', () => {
  it('renders terms page with content', () => {
    renderWithAppShell(<Terms />, { initialEntries: ['/terms'] })
    expect(document.getElementById('Terms-page')).toBeTruthy()
    expect(screen.getByText('Purpose')).toBeTruthy()
  })
})
