import React, { useEffect, useState } from 'react'
import {
  DEFAULT_DAYS_WARNING_MIN,
  DEFAULT_DAYS_WARNING_MAX,
} from 'constants/index'
import { Button, Card } from 'react-bootstrap'
import store from 'state/store'
import {
  resetSettingsSAC,
  setSettingsSAC,
} from 'state/sagas/settings/settings.actions'
import { useSettings } from 'state/settings'
import { clearAllReprsSAC } from 'state/sagas/reprs/reprs.actions'
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

  return (
    <div style={{ margin: '10px' }}>
      <h2>Settings</h2>
      <SettingsCardNumber
        onChange={setPracticeDelay}
        value={practiceDelayValue}
        subtitle="Practiced Delay"
        text="After how many days do you want to be alerted of a need to practice?"
      />
      <SettingsCardNumber
        onChange={setWarningRatio}
        value={warningRatioValue}
        subtitle="Warning Ratio"
        text="After what portion of the practice delay time do you want to be warned? If you set it at 0.5, then after half of the time is lapsed, the card will turn orange to warn you."
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
          Save Settings Changes
        </Button>

        <Button
          style={{ margin: '5px' }}
          variant="danger"
          onClick={() => {
            setPracticeDelayValue(previousSettings.practiceDelay)
            setWarningRatioValue(previousSettings.warningRatio)
          }}
        >
          Clear Settings Changes
        </Button>
      </div>

      <hr />

      <Card bg="light">
        <Card.Title>Reset All Settings to Default</Card.Title>
        <Card.Title>This will reset the settings to their defaults.</Card.Title>
        <Card.Body>
          <Button
            variant="warning"
            onClick={() => {
              store.dispatch(resetSettingsSAC())
            }}
          >
            Reset All Settings
          </Button>
        </Card.Body>
      </Card>

      <hr />

      <Card bg="light">
        <Card.Title>Reset All Reprs</Card.Title>
        <Card.Title>Delete All Reprs and Categories</Card.Title>
        <Card.Body>
          <Button
            variant="danger"
            onClick={() => {
              store.dispatch(clearAllReprsSAC())
            }}
          >
            Delete All Reprs
          </Button>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Settings
