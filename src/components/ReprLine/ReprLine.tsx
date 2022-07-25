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

export interface ReprLineProps {
  repr: Repr
}

type ReprColor = { bg: string; border: string }

const ReprLine: FC<ReprLineProps> = ({ repr }) => {
  const { t } = useL10n()
  const { title, id, datesPracticed } = repr
  const lastPracticed = datesPracticed[0] || 0
  const reprColors = getReprColors(lastPracticed)
  const navigate = useNavigate()
  return (
    <Card
      text="dark"
      className="mb-2"
      style={{
        margin: '10px',
        padding: '5px',
        borderRadius: '5px',
        boxShadow: '0.5px 1px 1px 2px #eee',
        backgroundColor: reprColors.bg,
        display: 'flex',
        flexDirection: 'row',
      }}
      onClick={() => navigate(`view/${id}`)}
    >
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Subtitle>
          {t('common.lastPracticed')}:{' '}
          {lastPracticed ? getDateAndFrom(lastPracticed) : t('common.never')}
        </Card.Subtitle>
      </Card.Body>

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

      <ReprButton type={ReprButtonType.PRACTICED} actionData={id} />
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
