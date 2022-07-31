import React, { FC } from 'react'
import Card from 'react-bootstrap/Card'

import { Repr } from 'types'
import { ModalSelection } from 'modals/ModalContainer/ModalContainer.types'
import { useNavigate } from 'react-router-dom'
import { getDateAndFrom } from 'utilities'
import ReprButton, { ReprButtonType } from 'components/ReprButton'
import { useL10n } from 'modules/Localization'
import CategoryPills from 'components/CategoryPills'
import { useSettings } from 'state/settings'
import { getReprColors } from './ReprLine.helpers'
import './ReprLine.css'

export interface ReprLineProps {
  repr: Repr
}

const ReprLine: FC<ReprLineProps> = ({ repr }) => {
  const { t } = useL10n()
  const { settings } = useSettings()
  const { title, id, datesPracticed, categories, comment } = repr
  const lastPracticed = datesPracticed[0] || 0
  const reprColors = getReprColors(lastPracticed, settings)
  const navigate = useNavigate()

  return (
    <Card
      text="dark"
      className={`repr-line-component mb-2 ${reprColors.className}`}
      onClick={() => navigate(`view/${id}`)}
    >
      <Card.Body style={{ minWidth: '50%' }}>
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
          containerStyle={{
            width: '300px',
            padding: '0 20px',
          }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <ReprButton
          type={ReprButtonType.EDIT}
          actionData={{ selection: ModalSelection.EDIT_REPR, props: { repr } }}
          style={{ margin: '0 4px 2px 0' }}
        />

        <ReprButton
          type={ReprButtonType.DELETE}
          actionData={id}
          style={{ margin: '2px 4px 0 0' }}
        />
      </div>

      <ReprButton
        style={{ height: '80px' }}
        type={ReprButtonType.PRACTICED}
        actionData={id}
      />
    </Card>
  )
}

export default ReprLine
