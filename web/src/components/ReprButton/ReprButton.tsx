import { useL10n } from 'modules/Localization'
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

const ReprButton: FC<ReprButtonProps> = ({ type, actionData, style }) => {
  const { t } = useL10n()

  const typeDataMap = {
    [ReprButtonType.EDIT]: {
      variant: 'warning',
      actionCreator: setModal,
      text: t('buttons.edit'),
    },
    [ReprButtonType.DELETE]: {
      variant: 'danger',
      actionCreator: removeReprSAC,
      text: t('buttons.delete'),
    },
    [ReprButtonType.PRACTICED]: {
      variant: 'success',
      actionCreator: markReprPracticedSAC,
      text: t('buttons.practiced'),
    },
  }

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
