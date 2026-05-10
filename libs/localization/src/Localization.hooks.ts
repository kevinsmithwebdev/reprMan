import LocalizationModule from './Localization.module'

export const useL10n = () => {
  const localization = LocalizationModule.getInstance()
  return {
    t: localization.t,
  }
}
