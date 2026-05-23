import React, { useEffect, useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { Navigate } from 'react-router-dom'
import { CenteredSpinner } from '@reprman/components'
import {
  COPYRIGHT_YEAR,
  DEFAULT_DAYS_WARNING_MAX,
  DEFAULT_DAYS_WARNING_MIN,
} from '@reprman/constants'
import {
  homeAuthGateActive,
  isCognitoConfigured,
  useCognitoAuth,
} from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'
import { useSettings } from '@reprman/state'
import { saveUserSettingsSAC } from '@reprman/state/sagas/settings'
import { useDispatch } from 'react-redux'

import packageJson from '../../../package.json'
import SettingsCardNumber from './SettingsCardNumber'
import SupplementalSettingsCard from './SupplementalSettingsCard'
import { getSupplementalSettingsCardData } from './Settings.helpers'

const Settings = () => {
  const dispatch = useDispatch()
  const { sessionChecked, signedIn } = useCognitoAuth()
  const { settings: previousSettings } = useSettings()
  const [practiceDelayValue, setPracticeDelayValue] = useState(
    previousSettings.practiceDelay
  )

  const setPracticeDelay = (e: any) => {
    const {
      target: { value },
    } = e
    const normalizedValue = +value
    if (
      normalizedValue >= DEFAULT_DAYS_WARNING_MIN &&
      normalizedValue <= DEFAULT_DAYS_WARNING_MAX
    ) {
      setPracticeDelayValue(normalizedValue)
    }
  }

  const [warningRatioValue, setWarningRatioValue] = useState(
    previousSettings.warningRatio
  )

  useEffect(() => {
    setPracticeDelayValue(previousSettings.practiceDelay)
    setWarningRatioValue(previousSettings.warningRatio)
  }, [previousSettings])

  const setWarningRatio = (e: any) => {
    const {
      target: { value },
    } = e
    const normalizedValue = Math.round(+value * 10) / 10
    if (normalizedValue >= 0 && normalizedValue <= 1) {
      setWarningRatioValue(normalizedValue)
    }
  }

  const { t } = useL10n()

  if (homeAuthGateActive && isCognitoConfigured && !sessionChecked) {
    return <CenteredSpinner id="Settings-page" />
  }

  if (homeAuthGateActive && !signedIn) {
    return <Navigate to="/" replace />
  }

  const supplementalSettingsCardData = getSupplementalSettingsCardData()

  return (
    <div className="app-page-padded" id="Settings-page">
      <h2>{t('pages.settings.title')}</h2>
      <SettingsCardNumber
        onChange={setPracticeDelay}
        value={practiceDelayValue}
        subtitle={t('pages.settings.practiceDelay.subtitle')}
        text={t('pages.settings.practiceDelay.text')}
      />
      <SettingsCardNumber
        onChange={setWarningRatio}
        value={warningRatioValue}
        subtitle={t('pages.settings.warningRatio.subtitle')}
        text={t('pages.settings.warningRatio.text')}
        step={0.1}
      />
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <Button
          style={{ margin: '5px' }}
          variant="success"
          onClick={() =>
            dispatch(
              saveUserSettingsSAC({
                practiceDelay: +practiceDelayValue,
                warningRatio: +warningRatioValue,
              })
            )
          }
        >
          {t('pages.settings.saveSettingsChanges')}
        </Button>

        <Button
          style={{ margin: '5px' }}
          variant="warning"
          onClick={() => {
            setPracticeDelayValue(previousSettings.practiceDelay)
            setWarningRatioValue(previousSettings.warningRatio)
          }}
        >
          {t('pages.settings.clearSettingsChanges')}
        </Button>
      </div>

      <hr style={{ borderWidth: '3px' }} />

      {/* @ts-ignore */}
      {supplementalSettingsCardData.map(SupplementalSettingsCard)}

      <Card.Body style={{ textAlign: 'center', paddingTop: '20px' }}>
        {`${t('brand.copyright', {
          year: COPYRIGHT_YEAR,
        })} - ${t('brand.versionNumber', {
          versionNumber: packageJson.version,
        })}`}
      </Card.Body>
    </div>
  )
}

export default Settings
