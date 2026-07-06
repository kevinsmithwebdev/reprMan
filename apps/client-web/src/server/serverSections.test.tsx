import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ServerAboutSection } from './ServerAboutSection'
import { ServerTermsSection } from './ServerTermsSection'

vi.mock('@reprman/localization/server', () => ({
  getServerTranslation: async () => ({
    t: (key: string, opts?: { returnObjects?: boolean }) => {
      if (opts?.returnObjects) {
        return {
          subtitle: `${key}.subtitle`,
          body: [[`${key}.paragraph`]],
        }
      }
      return key
    },
  }),
}))

describe('server sections', () => {
  it('renders about and terms sections from translation objects', async () => {
    render(await ServerAboutSection({ slug: 'pages.about.historySection' }))
    expect(screen.getByText('pages.about.historySection.subtitle')).toBeTruthy()

    render(await ServerTermsSection({ slug: 'pages.terms.purposeSection' }))
    expect(screen.getByText('pages.terms.purposeSection.subtitle')).toBeTruthy()
  })
})
