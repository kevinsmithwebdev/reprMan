import { createPageMetadata } from '@reprman/localization/server'
import SubscribeView from '../../src/views/SubscribeView'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.subscribe.title',
    noindex: true,
  })
}

const SubscribePage = () => <SubscribeView />

export default SubscribePage
