import { createPageMetadata } from '@reprman/localization/server'
import ForgotPasswordView from '../../src/views/ForgotPasswordView'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.forgotPassword.title',
    noindex: true,
  })
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />
}
