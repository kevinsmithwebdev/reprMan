import React, { FC } from 'react'
import Repr from 'components/Repr'
import { useReprs } from 'state/reprs'
import { Button } from 'react-bootstrap'
import store from 'state/store'
import { setModal } from 'state/modal'
import { ModalSelection } from 'modals/ModalContainer/ModalContainer.types'
import { ReprsListProps } from './ReprsList.types'

const ReprsList: FC<ReprsListProps> = () => {
  const { reprs } = useReprs()

  const hasReprs = !!reprs.length

  return (
    <div>
      {hasReprs ? (
        reprs.map((r) => <Repr key={r.id} repr={r} />)
      ) : (
        <p>No reprs found.</p>
      )}
      {/* TODO: move to App */}
      <Button
        variant="success"
        style={{ margin: 10, padding: 10 }}
        onClick={() =>
          store.dispatch(
            setModal({ selection: ModalSelection.EDIT_REPR, props: {} })
          )
        }
      >
        + Add Repr
      </Button>
    </div>
  )
}

export default ReprsList
