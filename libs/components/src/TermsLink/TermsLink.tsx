import { useL10n } from '@reprman/localization'
import React, { FC, useState } from 'react'
import { Button } from 'react-bootstrap'
import TermsModal from '../TermsModal'

interface TermsLinkProps {
  children?: React.ReactNode
  className?: string
}

const TermsLink: FC<TermsLinkProps> = ({ children, className }) => {
  const { t } = useL10n()
  const [showTerms, setShowTerms] = useState(false)

  return (
    <>
      <Button
        variant="link"
        className={['p-0 align-baseline', className].filter(Boolean).join(' ')}
        onClick={(ev) => {
          ev.preventDefault()
          ev.stopPropagation()
          setShowTerms(true)
        }}
      >
        {children ?? t('auth.signUpTermsLink')}
      </Button>
      <TermsModal show={showTerms} onHide={() => setShowTerms(false)} />
    </>
  )
}

export default TermsLink
