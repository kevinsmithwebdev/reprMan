import { useL10n } from '@reprman/localization'
import React, { FC } from 'react'
import { Button } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { setModal } from '@reprman/state/modal'
import {
  markReprPracticedSAC,
  removeReprSAC,
} from '@reprman/state/sagas/reprs/reprs.actions'

interface ReprButtonProps {
  style?: any
  type: ReprButtonType
  actionData: any
  className?: string
  /** Blocks the action without changing button appearance. */
  actionDisabled?: boolean
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
  actionDisabled = false,
}) => {
  const dispatch = useDispatch()
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
        if (actionDisabled) return
        dispatch(typeData.actionCreator(actionData))
      }}
    >
      {typeData.text}
    </Button>
  )
}

export default ReprButton
