import { createPageMetadata } from '@reprman/localization/server'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.about.title',
    canonicalPath: '/about',
  })
}

export { AboutPageContent as default } from '../../src/server/AboutPageContent'
