import { createPageMetadata } from '@reprman/localization/server'
import { AboutPageContent } from '../../src/server/AboutPageContent'

export async function generateMetadata() {
  return createPageMetadata({ titleKey: 'pages.about.title' })
}

export default function AboutPage() {
  return <AboutPageContent />
}
