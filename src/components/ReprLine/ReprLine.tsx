import React, { FC } from 'react'
import Card from 'react-bootstrap/Card'
import moment from 'moment'
import { Repr } from 'types'
import { ModalSelection } from 'modals/ModalContainer/ModalContainer.types'
import { DEFAULT_DAYS_WARNING } from 'constants/index'
import { useNavigate } from 'react-router-dom'
import { getDateAndFrom } from 'utilities/dates'
import ReprButton, { ReprButtonType } from 'components/ReprButton'
import { useL10n } from 'modules/Localization'
import CategoryPills from 'components/CategoryPills'

export interface ReprLineProps {
  repr: Repr
}

type ReprColor = { bg: string; border: string }

const ReprLine: FC<ReprLineProps> = ({ repr }) => {
  const { t } = useL10n()
  const { title, id, datesPracticed, categories, comment } = repr
  const lastPracticed = datesPracticed[0] || 0
  const reprColors = getReprColors(lastPracticed)
  const navigate = useNavigate()
  return (
    <Card
      text="dark"
      className="mb-2"
      style={{
        padding: '5px',
        margin: '10px 0',
        borderRadius: '5px',
        boxShadow: '0.5px 1px 1px 2px #eee',
        backgroundColor: reprColors.bg,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
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

const WARN_PERCENTAGE = 0.5

const getReprColors = (
  lastPracticed: number,
  daysOverdueTrigger: number = DEFAULT_DAYS_WARNING
): ReprColor => {
  const daysAgo = moment().diff(lastPracticed, 'days')

  if (daysAgo > daysOverdueTrigger) {
    return { bg: '#fff6f6', border: 'danger' }
  }

  if (daysAgo > daysOverdueTrigger * WARN_PERCENTAGE) {
    return { bg: '#fef9e4', border: 'warning' }
  }

  return { bg: '#f6fff6', border: 'success' }
}
