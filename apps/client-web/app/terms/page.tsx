import { createPageMetadata } from '@reprman/localization/server'

export async function generateMetadata() {
  return createPageMetadata({ titleKey: 'pages.terms.title' })
}

export { TermsPageContent as default } from '../../src/server/TermsPageContent'
