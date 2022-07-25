import React, { FC } from 'react'
import { Card } from 'react-bootstrap'

interface SettingsCardNumberProp {
  onChange: (a: any) => void
  value: number
  subtitle: string
  text: string
  step?: number
}

const SettingsCardNumber: FC<SettingsCardNumberProp> = ({
  onChange,
  value,
  subtitle,
  text,
  step = 1,
}) => {
  return (
    <Card
      style={{ padding: '10px', margin: '10px 0', maxWidth: '600px' }}
      bg="light"
    >
      <div
        style={{
          display: 'flex',
        }}
      >
        <div style={{ flex: 1 }}>
          <Card.Subtitle>{subtitle}</Card.Subtitle>
          <Card.Text>{text}</Card.Text>
        </div>
        <input
          style={{
            width: '60px',
            height: '50px',
            textAlign: 'center',
            margin: 'auto',
          }}
          type="number"
          onChange={onChange}
          value={value}
          step={step}
        />
      </div>
    </Card>
  )
}

export default SettingsCardNumber
