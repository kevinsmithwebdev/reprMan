import { createPageMetadata } from '@reprman/localization/server'
import SettingsView from '../../src/views/SettingsView'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.settings.title',
    noindex: true,
  })
}

export default function SettingsPage() {
  return <SettingsView />
}
