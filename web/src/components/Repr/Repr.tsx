import React, { FC } from 'react'
import Card from 'react-bootstrap/Card'
import moment from 'moment'
import { Repr } from 'types'
import { Button } from 'react-bootstrap'
import store from 'state/store'
import {
  markReprPracticedSAC,
  removeReprSAC,
} from 'state/sagas/reprs/reprs.actions'
import { setModal } from 'state/modal'
import { ModalSelection } from 'modals/ModalContainer/ModalContainer.types'
import { DEFAULT_DAYS_WARNING } from 'constants/index'

export interface ReprProps {
  repr: Repr
}

type ReprColor = { bg: string; border: string }

const ReprComponent: FC<ReprProps> = ({ repr }) => {
  const { title, id, datesPracticed } = repr
  const lastPracticed = datesPracticed[0] || 0
  const reprColors = getReprColors(lastPracticed)
  const lastPracticedMoment = moment(lastPracticed)

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
    >
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Subtitle>
          Last Practiced:{' '}
          {lastPracticed
            ? `${lastPracticedMoment.format(
                'MMMM Do YYYY, h:mm a'
              )}, ${lastPracticedMoment.fromNow()}`
            : 'never'}
        </Card.Subtitle>
      </Card.Body>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Button
          variant="warning"
          style={{ flex: 1, margin: '0 4px 2px 0' }}
          onClick={() =>
            store.dispatch(
              setModal({ selection: ModalSelection.EDIT_REPR, props: { repr } })
            )
          }
        >
          Edit
        </Button>

        <Button
          variant="danger"
          style={{ flex: 1, margin: '2px 4px 0 0' }}
          onClick={() => store.dispatch(removeReprSAC(id))}
        >
          Delete
        </Button>
      </div>

      <Button
        variant="success"
        onClick={() => store.dispatch(markReprPracticedSAC(id))}
      >
        Practiced
      </Button>
    </Card>
  )
}

export default ReprComponent

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
