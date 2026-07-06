import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ServerAboutSection } from './ServerAboutSection'
import { ServerTermsSection } from './ServerTermsSection'

describe('server sections', () => {
  it('renders about and terms sections from translation objects', () => {
    render(
      <ServerAboutSection
        section={{
          subtitle: 'pages.about.historySection.subtitle',
          body: [['pages.about.historySection.paragraph']],
        }}
      />
    )
    expect(screen.getByText('pages.about.historySection.subtitle')).toBeTruthy()

    render(
      <ServerTermsSection
        section={{
          subtitle: 'pages.terms.purposeSection.subtitle',
          body: [['pages.terms.purposeSection.paragraph']],
        }}
      />
    )
    expect(screen.getByText('pages.terms.purposeSection.subtitle')).toBeTruthy()
  })
})
