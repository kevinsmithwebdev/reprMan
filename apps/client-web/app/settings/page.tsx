import { createPageMetadata } from '@reprman/localization/server'
import SettingsView from '../../src/views/SettingsView'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.settings.title',
    noindex: true,
  })
}

const SettingsPage = () => <SettingsView />

export default SettingsPage
