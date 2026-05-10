import React, { useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { Eye, EyeSlash } from 'react-bootstrap-icons'
import { useL10n } from '@reprman/localization'

export type PasswordFormControlProps = {
  value: string
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
  autoComplete?: string
  disabled?: boolean
  required?: boolean
  minLength?: number
  className?: string
}

const PasswordFormControl = ({
  value,
  onChange,
  autoComplete,
  disabled,
  required,
  minLength,
  className,
}: PasswordFormControlProps) => {
  const { t } = useL10n()
  const [visible, setVisible] = useState(false)

  return (
    <InputGroup className={className}>
      <Form.Control
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        minLength={minLength}
      />
      <Button
        variant="outline-secondary"
        type="button"
        disabled={disabled}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        aria-pressed={visible}
      >
        {visible ? <EyeSlash aria-hidden /> : <Eye aria-hidden />}
      </Button>
    </InputGroup>
  )
}

export default PasswordFormControl
