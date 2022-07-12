import React, { FC } from 'react'
import { ReprProps } from './Repr.types'
import Card from 'react-bootstrap/Card'
import moment from 'moment'
import { useSettings } from 'state/settings'

type ReprColor = { bg: string; border: string }

const Repr: FC<ReprProps> = ({ repr: { title, created, lastPracticed } }) => {
  const {
    settings: { daysOverdueTrigger },
  } = useSettings()
  const reprColors = getReprColors(lastPracticed, daysOverdueTrigger)
  const lastPracticedMoment = moment(lastPracticed)

  return (
    <Card
      text="dark"
      className="mb-2"
      style={{
        margin: '20px',
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
    </Card>
  )
}

export default Repr

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

const styles = {
  card: {
    margin: '20px',
    padding: '5px',
    borderRadius: '5px',
    boxShadow: '0.5px 1px 1px 2px #eee',
  },
}
