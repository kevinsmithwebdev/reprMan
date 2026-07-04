import { createPageMetadata } from '@reprman/localization/server'
import ViewReprView from '../../src/views/ViewReprView'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.viewRepr.title',
    noindex: true,
  })
}

export default function ViewReprPage() {
  return <ViewReprView />
}
