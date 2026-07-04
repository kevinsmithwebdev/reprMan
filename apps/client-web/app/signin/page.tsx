import { createPageMetadata } from '@reprman/localization/server'
import SignInView from '../../src/views/SignInView'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.signin.title',
    noindex: true,
  })
}

export default function SignInPage() {
  return <SignInView />
}
