import React, { FC } from 'react'
import Card from 'react-bootstrap/Card'
import moment from 'moment'
import { Repr } from 'types'
import { Button } from 'react-bootstrap'
import store from 'state/store'
import { removeReprSAC } from 'state/sagas/reprs/reprs.actions'
import { setModal } from 'state/modal'
import { ModalSelection } from 'modals/ModalContainer/ModalContainer.types'

export interface ReprProps {
  repr: Repr
}

type ReprColor = { bg: string; border: string }

const ReprComponent: FC<ReprProps> = ({ repr }) => {
  const { title, id } = repr
  const reprColors = getReprColors(1, 2)
  const lastPracticedMoment = moment(1)

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
      }}
    >
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Subtitle>
          Last Practiced: {lastPracticedMoment.format('MMMM Do YYYY, h:mm a')},{' '}
          {lastPracticedMoment.fromNow()}
        </Card.Subtitle>
      </Card.Body>

      <Button
        variant="warning"
        onClick={() =>
          store.dispatch(
            setModal({ selection: ModalSelection.EDIT_REPR, props: { repr } })
          )
        }
      >
        E
      </Button>

      <Button
        variant="danger"
        onClick={() => store.dispatch(removeReprSAC(id))}
      >
        X
      </Button>
    </Card>
  )
}

export default ReprComponent

const WARN_VALUE = 0.5

const getReprColors = (
  lastPracticed: number,
  daysOverdueTrigger: number
): ReprColor => {
  const daysAgo = moment().diff(lastPracticed, 'days')

  if (daysAgo > daysOverdueTrigger) return { bg: '#fff6f6', border: 'danger' }
  if (daysAgo > daysOverdueTrigger * WARN_VALUE)
    return { bg: '#fef9e4', border: 'warning' }
  return { bg: '#f6fff6', border: 'success' }
}

// const styles = {
//   card: {
//     margin: '20px',
//     padding: '5px',
//     borderRadius: '5px',
//     boxShadow: '0.5px 1px 1px 2px #eee',
//   },
// }
