import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'
import { useL10n } from '@reprman/localization'
import React, { FC } from 'react'
import { Button } from 'react-bootstrap'
import { setModal } from '@reprman/state/modal'
import { selectAtReprLimit } from '@reprman/state/reprsQuota'
import store from '@reprman/state/store'
import { useSelector } from 'react-redux'

interface AddReprButtonProps {}

const AddReprButton: FC<AddReprButtonProps> = () => {
  const { t } = useL10n()
  const atLimit = useSelector(selectAtReprLimit)

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
      disabled={atLimit}
      title={atLimit ? t('billing.reprLimitReachedShort') : undefined}
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
