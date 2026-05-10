import LocalizationModule from 'modules/Localization/Localization.module'
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
  ]
}
