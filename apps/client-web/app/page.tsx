import { createPageMetadata } from '@reprman/localization/server'
import { HomePage } from '../src/views/HomePage'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'auth.homeSignedOutTitle',
    descriptionKey: 'meta.description',
  })
}

export default function Page() {
  return <HomePage />
}
