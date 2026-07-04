import { createPageMetadata } from '@reprman/localization/server'
import SubscribeView from '../../src/views/SubscribeView'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.subscribe.title',
    noindex: true,
  })
}

export default function SubscribePage() {
  return <SubscribeView />
}
