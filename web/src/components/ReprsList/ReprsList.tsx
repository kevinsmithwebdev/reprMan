import React, { FC } from 'react'
import Repr from 'components/ReprLine'
import { useReprs } from 'state/reprs'
import { ReprsListProps } from './ReprsList.types'

const ReprsList: FC<ReprsListProps> = () => {
  const { reprs } = useReprs()

  const hasReprs = !!reprs.length

  return (
    <div>
      {hasReprs ? (
        reprs.map((r) => <Repr key={r.id} repr={r} />)
      ) : (
        <p>No reprs found.</p>
      )}
    </div>
  )
}

export default ReprsList
