import React from 'react'
import ReprsList from 'components/ReprsList'
import { Button } from 'react-bootstrap'
import { ModalSelection } from 'modals/ModalContainer/ModalContainer.types'
import store from 'state/store'
import { setModal } from 'state/modal'

const Home = () => {
  return (
    <>
      <ReprsList reprs={[]} />
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
    </>
  )
}

export default Home
