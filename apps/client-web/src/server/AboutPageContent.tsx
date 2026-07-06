import { MY_EMAIL } from '@reprman/constants'
import { getServerTranslation } from '@reprman/localization/server'
import { ServerAboutSection, type AboutSectionData } from './ServerAboutSection'

const ABOUT_SECTION_SLUGS = [
  'pages.about.historySection',
  'pages.about.instructionsSection',
  'pages.about.futureSection',
] as const

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

      <ServerAboutSection
        section={
          t(ABOUT_SECTION_SLUGS[0], {
            returnObjects: true,
          }) as unknown as AboutSectionData
        }
      />

      <hr />

      <ServerAboutSection
        section={
          t(ABOUT_SECTION_SLUGS[1], {
            returnObjects: true,
          }) as unknown as AboutSectionData
        }
      />

      <hr />

      <ServerAboutSection
        section={
          t(ABOUT_SECTION_SLUGS[2], {
            returnObjects: true,
          }) as unknown as AboutSectionData
        }
      />

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
