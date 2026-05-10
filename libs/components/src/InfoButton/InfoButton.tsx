import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'
import React, { FC } from 'react'
import { InfoCircleFill } from 'react-bootstrap-icons'
import { setModal } from '@reprman/state/modal'
import store from '@reprman/state/store'

interface InfoButtonProps {
  title: string
  body: string[]
}

const InfoButton: FC<InfoButtonProps> = ({ title, body }) => (
  <InfoCircleFill
    color="blue"
    onClick={() =>
      store.dispatch(
        setModal({
          selection: ModalSelection.INFO,
          props: {
            title,
            body,
          },
        })
      )
    }
  />
)

export default InfoButton
