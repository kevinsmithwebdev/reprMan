import React from 'react'
import { Spinner } from 'react-bootstrap'

interface CenteredSpinnerProps {
  /** Optional id, useful for page-level test selectors. */
  id?: string
  /** Layout: page-section padding (`section`) or fill the parent (`fill`). */
  layout?: 'section' | 'fill'
}

const CenteredSpinner = ({
  id,
  layout = 'section',
}: CenteredSpinnerProps) => {
  const className =
    layout === 'fill'
      ? 'd-flex justify-content-center align-items-center h-100'
      : 'd-flex justify-content-center py-5'
  return (
    <div className={className} id={id}>
      <Spinner animation="border" role="status" />
    </div>
  )
}

export default CenteredSpinner
