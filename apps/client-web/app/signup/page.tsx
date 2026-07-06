import { createPageMetadata } from '@reprman/localization/server'
import SignupView from '../../src/views/SignupView'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.signup.title',
    noindex: true,
  })
}

const SignupPage = () => <SignupView />

export default SignupPage
