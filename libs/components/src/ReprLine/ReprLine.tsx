import React, { FC } from 'react'
import Card from 'react-bootstrap/Card'

import { Repr } from '@reprman/types'
import { useNavigate } from 'react-router-dom'
import { getDateAndFrom } from '@reprman/utilities'
import ReprButton, { ReprButtonType } from '@reprman/components/ReprButton'
import { useL10n } from '@reprman/localization'
import CategoryPills from '@reprman/components/CategoryPills'
import { useSettings } from '@reprman/state/settings'
import { getReprColors } from './ReprLine.helpers'
import './ReprLine.css'

export interface ReprLineProps {
  repr: Repr
}

const ReprLine: FC<ReprLineProps> = ({ repr }) => {
  const { t } = useL10n()
  const { settings } = useSettings()
  const { title, id, datesPracticed, categories, comment, learning } = repr
  const lastPracticed = datesPracticed[0] || 0
  const reprColors = getReprColors(lastPracticed, settings, learning)
  const navigate = useNavigate()

  return (
    <Card
      text="dark"
      className={`repr-line-component mb-2 ${reprColors.className}`}
      onClick={() => navigate(`view/${id}`)}
    >
      <Card.Body className="repr-line-body">
        <Card.Title style={{ fontWeight: 700 }}>{title}</Card.Title>
        {!!comment && (
          <Card.Subtitle style={{ padding: '5px 0' }}>
            <span style={{ fontWeight: 700 }}>
              {`${t('pages.viewRepr.data.comment')}: `}
            </span>
            <span style={{ fontStyle: 'italic' }}>{comment}</span>
          </Card.Subtitle>
        )}
        <Card.Subtitle style={{ padding: '2px 0' }}>
          <span style={{ fontWeight: 700 }}>{t('common.lastPracticed')}:</span>{' '}
          {lastPracticed ? getDateAndFrom(lastPracticed) : t('common.never')}
        </Card.Subtitle>
      </Card.Body>

      {!!categories.length && (
        <CategoryPills
          categories={categories}
          containerStyle={{ padding: '0 20px' }}
          className="repr-line-pills"
        />
      )}

      <ReprButton
        className="repr-line-button"
        type={ReprButtonType.PRACTICED}
        actionData={id}
      />
    </Card>
  )
}

export default ReprLine
