import { ModalSelection } from 'modals/ModalContainer/ModalContainer.types'
import { useL10n } from 'modules/Localization'
import React from 'react'
import { Button } from 'react-bootstrap'
import { setModal } from 'state/modal'
import store from 'state/store'

const AddReprButton = () => {
  const { t } = useL10n()
  return (
    <Button
      variant="success"
      style={{
        margin: '10px',
        padding: '10px',
        fontWeight: '600',
        fontSize: '24px',
      }}
      onClick={() =>
        store.dispatch(
          setModal({ selection: ModalSelection.EDIT_REPR, props: {} })
        )
      }
    >
      {t('buttons.addReprButton')}
    </Button>
  )
}

export default AddReprButton
