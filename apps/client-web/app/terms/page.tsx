import { createPageMetadata } from '@reprman/localization/server'
import { TermsPageContent } from '../../src/server/TermsPageContent'

export async function generateMetadata() {
  return createPageMetadata({ titleKey: 'pages.terms.title' })
}

export default function TermsPage() {
  return <TermsPageContent />
}
