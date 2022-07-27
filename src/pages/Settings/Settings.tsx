import React, { useEffect, useState } from 'react'
import {
  DEFAULT_DAYS_WARNING_MIN,
  DEFAULT_DAYS_WARNING_MAX,
  COPYRIGHT_YEAR,
} from 'constants/index'
import { Button, Card } from 'react-bootstrap'
import store from 'state/store'
import {
  resetSettingsSAC,
  setSettingsSAC,
} from 'state/sagas/settings/settings.actions'
import { useSettings } from 'state/settings'
import { clearAllReprsSAC } from 'state/sagas/reprs/reprs.actions'
import { useL10n } from 'modules/Localization'
import packageJson from '../../../package.json'
import SettingsCardNumber from './SettingsCardNumber'

const Settings = () => {
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
  return (
    <div style={{ margin: '10px' }}>
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
      <div style={{}}>
        <Button
          style={{ margin: '5px' }}
          variant="success"
          onClick={() =>
            store.dispatch(
              setSettingsSAC({
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

      <hr />

      <Card bg="light" style={{ maxWidth: '600px' }}>
        <Card.Title>{t('pages.settings.resetSettings.title')}</Card.Title>
        <Card.Subtitle>
          {t('pages.settings.resetSettings.subtitle')}
        </Card.Subtitle>
        <Card.Body>
          <Button
            variant="warning"
            onClick={() => {
              store.dispatch(resetSettingsSAC())
            }}
          >
            {t('pages.settings.resetSettings.button')}
          </Button>
        </Card.Body>
      </Card>

      <hr />

      <Card bg="light" style={{ maxWidth: '600px' }}>
        <Card.Title>{t('pages.settings.deleteAllReprs.title')}</Card.Title>
        <Card.Subtitle>
          {t('pages.settings.deleteAllReprs.subtitle')}
        </Card.Subtitle>
        <Card.Body>
          <Button
            variant="danger"
            onClick={() => {
              store.dispatch(clearAllReprsSAC())
            }}
          >
            {t('pages.settings.deleteAllReprs.button')}
          </Button>
        </Card.Body>
      </Card>
      <hr />
      <Card.Body>
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
