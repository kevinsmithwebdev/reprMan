import React, { FC } from 'react'
import { Button } from 'react-bootstrap'
import { setModal } from 'state/modal'
import {
  markReprPracticedSAC,
  removeReprSAC,
} from 'state/sagas/reprs/reprs.actions'
import store from 'state/store'

interface ReprButtonProps {
  style?: any
  type: ReprButtonType
  actionData: any
}

export enum ReprButtonType {
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  PRACTICED = 'PRACTICED',
}

const typeDataMap = {
  [ReprButtonType.EDIT]: {
    variant: 'warning',
    actionCreator: setModal,
    text: 'Edit',
  },
  [ReprButtonType.DELETE]: {
    variant: 'danger',
    actionCreator: removeReprSAC,
    text: 'Delete',
  },
  [ReprButtonType.PRACTICED]: {
    variant: 'success',
    actionCreator: markReprPracticedSAC,
    text: 'Practiced',
  },
}

const ReprButton: FC<ReprButtonProps> = ({ type, actionData, style }) => {
  const typeData = typeDataMap[type]
  return (
    <Button
      style={style}
      variant={typeData.variant}
      onClick={(e) => {
        e.stopPropagation()
        store.dispatch(typeData.actionCreator(actionData))
      }}
    >
      {typeData.text}
    </Button>
  )
}

export default ReprButton
