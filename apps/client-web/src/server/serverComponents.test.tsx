import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AboutPageContent } from './AboutPageContent'
import { TermsPageContent } from './TermsPageContent'

vi.mock('@reprman/localization/server', () => ({
  getServerTranslation: async () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('./ServerAboutSection', () => ({
  ServerAboutSection: ({ slug }: { slug: string }) => (
    <section data-testid="about-section">{slug}</section>
  ),
}))

vi.mock('./ServerTermsSection', () => ({
  ServerTermsSection: ({ slug }: { slug: string }) => (
    <section data-testid="terms-section">{slug}</section>
  ),
}))

describe('server page content', () => {
  it('renders about page content', async () => {
    render(await AboutPageContent())
    expect(document.getElementById('About-page')).toBeTruthy()
    expect(screen.getByText(/pages.about.title/)).toBeTruthy()
    expect(screen.getByAltText('pages.about.imageAlt')).toBeTruthy()
    expect(screen.getAllByTestId('about-section')).toHaveLength(3)
  })

  it('renders terms page with section separators', async () => {
    render(await TermsPageContent())
    expect(document.getElementById('Terms-page')).toBeTruthy()
    expect(screen.getAllByTestId('terms-section')).toHaveLength(6)
  })
})
