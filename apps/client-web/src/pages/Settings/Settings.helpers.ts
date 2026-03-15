import LocalizationModule from 'modules/Localization/Localization.module'
import {
  readReprsFromTextFileSAC,
  readReprsFromXlsxFileSAC,
  writeReprsToTextFileSAC,
  writeReprsToXlsxFileSAC,
} from 'state/sagas/files/files.actions'
import { clearAllReprsSAC } from 'state/sagas/reprs/reprs.actions'
import { resetSettingsSAC } from 'state/sagas/settings/settings.actions'
import store from 'state/store'

const { t } = LocalizationModule.getInstance()

export const getSupplementalSettingsCardData = () => {
  return [
    {
      title: t('pages.settings.resetSettings.title'),
      subtitle: t('pages.settings.resetSettings.subtitle'),
      buttons: [
        {
          text: t('pages.settings.resetSettings.button'),
          variant: 'warning',
          onClick: () => store.dispatch(resetSettingsSAC()),
        },
      ],
    },
    {
      title: t('pages.settings.deleteAllReprs.title'),
      subtitle: t('pages.settings.deleteAllReprs.subtitle'),
      buttons: [
        {
          text: t('pages.settings.deleteAllReprs.button'),
          variant: 'danger',
          onClick: () => store.dispatch(clearAllReprsSAC()),
        },
      ],
    },
    {
      title: t('pages.settings.textFile.title'),
      info: {
        title: t('pages.settings.textFile.info.title'),
        body: t('pages.settings.textFile.info.body', { returnObjects: true }),
      },
      subtitle: t('pages.settings.textFile.subtitle'),
      buttons: [
        {
          text: t('pages.settings.textFile.saveButton'),
          variant: 'dark',
          onClick: () => store.dispatch(writeReprsToTextFileSAC()),
        },
        {
          text: t('pages.settings.textFile.loadButton'),
          variant: 'secondary',
          onClick: () => store.dispatch(readReprsFromTextFileSAC()),
        },
      ],
    },
    {
      title: t('pages.settings.excelFile.title'),
      info: {
        title: t('pages.settings.excelFile.saveButton'),
        body: t('pages.settings.excelFile.info.body', { returnObjects: true }),
      },
      subtitle: t('pages.settings.excelFile.subtitle'),
      buttons: [
        {
          text: t('pages.settings.excelFile.saveButton'),
          variant: 'dark',
          onClick: () => store.dispatch(writeReprsToXlsxFileSAC()),
        },
        {
          text: t('pages.settings.excelFile.loadButton'),
          variant: 'secondary',
          onClick: () => store.dispatch(readReprsFromXlsxFileSAC()),
        },
      ],
    },
  ]
}
