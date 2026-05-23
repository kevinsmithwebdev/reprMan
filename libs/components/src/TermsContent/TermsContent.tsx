import React from 'react'
import TermsSection from '../TermsSection'

const TERMS_SECTIONS = [
  'pages.terms.purposeSection',
  'pages.terms.conductSection',
  'pages.terms.inactivitySection',
  'pages.terms.emailUseSection',
  'pages.terms.emailVolumeSection',
  'pages.terms.agreementSection',
] as const

const TermsContent = () => (
  <>
    {TERMS_SECTIONS.map((slug, index) => (
      <React.Fragment key={slug}>
        {index > 0 ? <hr /> : null}
        <TermsSection slug={slug} />
      </React.Fragment>
    ))}
  </>
)

export default TermsContent
