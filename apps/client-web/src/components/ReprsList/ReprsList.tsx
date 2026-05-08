import React, { FC } from 'react'
import Repr from 'components/ReprLine'
import { ReprsListProps } from './ReprsList.types'

const ReprsList: FC<ReprsListProps> = ({ reprs }) => {
  const hasReprs = !!reprs.length

  return (
    <div id="reprs-list-component" style={{ paddingTop: '8px' }}>
      {hasReprs && reprs.map((r) => <Repr key={r.id} repr={r} />)}
    </div>
  )
}

export default ReprsList
