import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import AboutSection from '../AboutSection/AboutSection'

describe('AboutSection (integration)', () => {
  it('renders localized section content', () => {
    renderWithAppShell(<AboutSection slug="pages.about.historySection" />)
    expect(screen.getByText('Why This App?')).toBeTruthy()
  })
})
