import { createPageMetadata } from '@reprman/localization/server'
import ChangePasswordView from '../../src/views/ChangePasswordView'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.changePassword.title',
    noindex: true,
  })
}

const ChangePasswordPage = () => <ChangePasswordView />

export default ChangePasswordPage
