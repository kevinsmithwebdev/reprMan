import React, { FC } from 'react'
import InfoButton from 'components/InfoButton'
import { Button, Card } from 'react-bootstrap'

interface ButtonProps {
  text: string
  variant: string
  onClick: Function
}

interface SupplementalSettingsCardProps {
  title: string
  info?: { title: string; body: string[] }
  subtitle: string
  buttons: ButtonProps[]
}

const SupplementalSettingsCard: FC<SupplementalSettingsCardProps> = ({
  title,
  info,
  subtitle,
  buttons,
}) => (
  <div
    style={{ padding: '10px 0', borderBottom: '1px solid #ccc' }}
    key={title}
  >
    <Card
      bg="light"
      style={{
        maxWidth: '600px',
        padding: '10px 10px 0 10px',
        margin: '10px 0',
      }}
    >
      <Card.Title>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{title}</span>
          {!!info && <InfoButton title={info.title} body={info.body} />}
        </div>
      </Card.Title>
      <Card.Subtitle>{subtitle}</Card.Subtitle>
      <Card.Body
        style={{
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        {buttons.map(SettingsButton)}
      </Card.Body>
    </Card>
  </div>
)

export default SupplementalSettingsCard

const SettingsButton = ({ text, variant, onClick }: any) => (
  <Button variant={variant} onClick={onClick} key={text}>
    {text}
  </Button>
)
