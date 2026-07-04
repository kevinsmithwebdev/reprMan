import React from 'react'
import Link from 'next/link'
import { Card } from 'react-bootstrap'
import { useL10n } from '@reprman/localization'

interface AuthUnavailableCardProps {
  /** Page id, used as the wrapping element id (e.g. `SignIn-page`). */
  pageId: string
  /** Localization key for the card title (e.g. `pages.signin.title`). */
  titleKey: string
  /** Localization key for the body text. */
  messageKey: string
}

/**
 * Rendered when Cognito is not configured for the build, on auth-related
 * pages that would otherwise show a sign-in / sign-up form.
 */
const AuthUnavailableCard = ({
  pageId,
  titleKey,
  messageKey,
}: AuthUnavailableCardProps) => {
  const { t } = useL10n()
  return (
    <Card.Body style={{ padding: '10px' }} id={pageId}>
      <Card.Title>{t(titleKey)}</Card.Title>
      <Card.Text>{t(messageKey)}</Card.Text>
      <Link href="/">{t('auth.signUpBackHome')}</Link>
    </Card.Body>
  )
}

export default AuthUnavailableCard
