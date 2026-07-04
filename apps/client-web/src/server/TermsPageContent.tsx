import { getServerTranslation } from '@reprman/localization/server'
import { ServerTermsSection } from './ServerTermsSection'

const TERMS_SECTIONS = [
  'pages.terms.purposeSection',
  'pages.terms.conductSection',
  'pages.terms.inactivitySection',
  'pages.terms.emailUseSection',
  'pages.terms.emailVolumeSection',
  'pages.terms.agreementSection',
] as const

export const TermsPageContent = async () => {
  const { t } = await getServerTranslation()

  return (
    <div className="app-page-padded card-body" id="Terms-page">
      <h1 className="card-title h5">{t('pages.terms.title')}</h1>
      {TERMS_SECTIONS.map((slug, index) => (
        <div key={slug}>
          {index > 0 ? <hr /> : null}
          <ServerTermsSection slug={slug} />
        </div>
      ))}
    </div>
  )
}
