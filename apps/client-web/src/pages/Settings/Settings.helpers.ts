import LocalizationModule from '@reprman/localization/Localization.module'
import { clearAllReprsSAC } from '@reprman/state/sagas/reprs/reprs.actions'
import { resetSettingsAC } from '@reprman/state/settings/settings.actions'
import store from '@reprman/state/store'

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
          onClick: () => store.dispatch(resetSettingsAC()),
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
