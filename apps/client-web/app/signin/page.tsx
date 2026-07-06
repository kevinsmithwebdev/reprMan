import { createPageMetadata } from '@reprman/localization/server'
import SignInView from '../../src/views/SignInView'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.signin.title',
    noindex: true,
  })
}

const SignInPage = () => <SignInView />

export default SignInPage
