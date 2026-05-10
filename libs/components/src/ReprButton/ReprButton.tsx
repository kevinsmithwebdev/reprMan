import { useL10n } from '@reprman/localization'
import React, { FC } from 'react'
import { Button } from 'react-bootstrap'
import { setModal } from '@reprman/state/modal'
import {
  markReprPracticedSAC,
  removeReprSAC,
} from '@reprman/state/sagas/reprs/reprs.actions'
import store from '@reprman/state/store'

interface ReprButtonProps {
  style?: any
  type: ReprButtonType
  actionData: any
  className?: string
}

export enum ReprButtonType {
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  PRACTICED = 'PRACTICED',
}

const ReprButton: FC<ReprButtonProps> = ({
  type,
  actionData,
  style,
  className,
}) => {
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
      className={className}
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
