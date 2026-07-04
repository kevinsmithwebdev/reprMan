import React, { FC } from 'react'
import { useModal } from '@reprman/state/modal'
import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'
import ConfirmationModal from '../ConfirmationModal'

const MobileModalHost: FC = () => {
  const { selection, props } = useModal()

  if (selection !== ModalSelection.CONFIRMATION) {
    return null
  }

  return (
    <ConfirmationModal
      title={(props as { title: string }).title}
      body={(props as { body: string }).body}
    />
  )
}

export default MobileModalHost
