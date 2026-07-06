import { createPageMetadata } from '@reprman/localization/server'
import ForgotPasswordView from '../../src/views/ForgotPasswordView'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.forgotPassword.title',
    noindex: true,
  })
}

const ForgotPasswordPage = () => <ForgotPasswordView />

export default ForgotPasswordPage
