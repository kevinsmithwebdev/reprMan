import { ModalSelection } from 'modals/ModalContainer/ModalContainer.types'
import { useL10n } from 'modules/Localization'
import React, { FC } from 'react'
import { Button } from 'react-bootstrap'
import { setModal } from 'state/modal'
import store from 'state/store'

interface AddReprButtonProps {}

const AddReprButton: FC<AddReprButtonProps> = () => {
  const { t } = useL10n()
  return (
    <Button
      variant="success"
      style={{
        margin: '8px 0',
        padding: '8px',
        fontWeight: '600',
        fontSize: '20px',
      }}
      id="add-repr-button"
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
