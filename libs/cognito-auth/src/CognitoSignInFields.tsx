import React from 'react'
import Link from 'next/link'
import PasswordFormControl from '@reprman/components/PasswordFormControl'
import { Form } from 'react-bootstrap'

export type CognitoSignInFieldsProps = {
  idPrefix: string
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  busy: boolean
  emailLabel: string
  passwordLabel: string
  createAccountLabel: string
  onCreateAccountNavigate?: () => void
  showCreateAccountLink?: boolean
}

const CognitoSignInFields = ({
  idPrefix,
  email,
  setEmail,
  password,
  setPassword,
  busy,
  emailLabel,
  passwordLabel,
  createAccountLabel,
  onCreateAccountNavigate,
  showCreateAccountLink = true,
}: CognitoSignInFieldsProps) => (
  <>
    <Form.Group className="mb-3" controlId={`${idPrefix}-email`}>
      <Form.Label>{emailLabel}</Form.Label>
      <Form.Control
        type="email"
        autoComplete="username"
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
        required
        disabled={busy}
      />
    </Form.Group>
    <Form.Group className="mb-3" controlId={`${idPrefix}-password`}>
      <Form.Label>{passwordLabel}</Form.Label>
      <PasswordFormControl
        autoComplete="current-password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
        required
        disabled={busy}
      />
    </Form.Group>
    {showCreateAccountLink ? (
      <p className="mb-0 small">
        <Link
          href="/signup"
          className="text-decoration-none"
          onClick={onCreateAccountNavigate}
        >
          {createAccountLabel}
        </Link>
      </p>
    ) : null}
  </>
)

export default CognitoSignInFields
