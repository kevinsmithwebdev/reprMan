/* eslint-disable react/jsx-props-no-spreading */

'use client'

import React, { useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import ModalContext from 'react-bootstrap/ModalContext'
import { clearModal, useModal } from '@reprman/state/modal'
import EditRepr, { EditReprProps } from '../EditRepr'
import Confirmation, { ConfirmationProps } from '../Confirmation'
import Query, { QueryProps } from '../Query'
import Info, { InfoProps } from '../Info/Info'
import { ModalSelection } from './ModalContainer.types'

const ModalContainer = () => {
  const dispatch = useDispatch()
  const { selection, props } = useModal()
  const closeModal = useCallback(() => dispatch(clearModal()), [dispatch])
  const modalContext = useMemo(() => ({ onHide: closeModal }), [closeModal])

  if (!selection) {
    return null
  }

  return (
    <ModalContext.Provider value={modalContext}>
      <div className="modal-backdrop fade show" />
      <dialog
        open
        className="modal fade show d-block"
        style={{ border: 'none', padding: 0, background: 'transparent' }}
        aria-labelledby="contained-modal-title-vcenter"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {selection === ModalSelection.EDIT_REPR && (
              <EditRepr {...(props as EditReprProps)} closeModal={closeModal} />
            )}

            {selection === ModalSelection.CONFIRMATION && (
              <Confirmation
                {...(props as ConfirmationProps)}
                closeModal={closeModal}
              />
            )}

            {selection === ModalSelection.QUERY && (
              <Query {...(props as QueryProps)} closeModal={closeModal} />
            )}

            {selection === ModalSelection.INFO && (
              <Info {...(props as InfoProps)} />
            )}
          </div>
        </div>
      </dialog>
    </ModalContext.Provider>
  )
}

export default ModalContainer
