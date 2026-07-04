import { MY_EMAIL } from '@reprman/constants'
import { getServerTranslation } from '@reprman/localization/server'
import { ServerAboutSection } from './ServerAboutSection'

export const AboutPageContent = async () => {
  const { t } = await getServerTranslation()

  return (
    <div className="app-page-padded card-body" id="About-page">
      <h1 className="card-title h5">{`${t('pages.about.title')} - ${t(
        'brand.reprMan'
      )} - ${t('brand.repertoireManagement')}`}</h1>

      <img
        src="/static/repr.jpg"
        alt={t('pages.about.imageAlt')}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          marginTop: '20px',
          marginBottom: '12px',
        }}
      />

      <ServerAboutSection slug="pages.about.historySection" />

      <hr />

      <ServerAboutSection slug="pages.about.instructionsSection" />

      <hr />

      <ServerAboutSection slug="pages.about.futureSection" />

      <ul>
        <li>{t('pages.about.futureItems.accounts')}</li>
        <li>{t('pages.about.futureItems.mobileVersions')}</li>
        <li>{t('pages.about.futureItems.sharing')}</li>
        <li>{t('pages.about.futureItems.scalesFeature')}</li>
        <li>{t('pages.about.futureItems.darkMode')}</li>
      </ul>

      <p className="card-text">
        {t('pages.about.suggestions', { email: MY_EMAIL })}
      </p>
    </div>
  )
}
