import { DEFAULT_DAYS_WARNING, DEFAULT_WARNING_RATIO } from '@reprman/constants'
import { clearAllReprsSAC } from '@reprman/state/sagas/reprs/reprs.actions'
import { saveUserSettingsSAC } from '@reprman/state/sagas/settings'
import type { AppDispatch } from '@reprman/state/store'

export const getSupplementalSettingsCardData = (
  dispatch: AppDispatch,
  translate: (key: string) => string
) => {
  return [
    {
      title: translate('pages.settings.resetSettings.title'),
      subtitle: translate('pages.settings.resetSettings.subtitle'),
      buttons: [
        {
          text: translate('pages.settings.resetSettings.button'),
          variant: 'warning',
          onClick: () =>
            dispatch(
              saveUserSettingsSAC({
                practiceDelay: DEFAULT_DAYS_WARNING,
                warningRatio: DEFAULT_WARNING_RATIO,
              })
            ),
        },
      ],
    },
    {
      title: translate('pages.settings.deleteAllReprs.title'),
      subtitle: translate('pages.settings.deleteAllReprs.subtitle'),
      buttons: [
        {
          text: translate('pages.settings.deleteAllReprs.button'),
          variant: 'danger',
          onClick: () => dispatch(clearAllReprsSAC()),
        },
      ],
    },
  ]
}
