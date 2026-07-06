import { createPageMetadata } from '@reprman/localization/server'
import ReportsView from '../../src/views/ReportsView'

export async function generateMetadata() {
  return createPageMetadata({
    titleKey: 'pages.reports.title',
    noindex: true,
  })
}

const ReportsPage = () => <ReportsView />

export default ReportsPage
