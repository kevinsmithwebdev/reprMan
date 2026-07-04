import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'
import React, { FC } from 'react'
import { InfoCircleFill } from 'react-bootstrap-icons'
import { useDispatch } from 'react-redux'
import { setModal } from '@reprman/state/modal'

interface InfoButtonProps {
  title: string
  body: string[]
}

const InfoButton: FC<InfoButtonProps> = ({ title, body }) => {
  const dispatch = useDispatch()

  return (
    <InfoCircleFill
      color="blue"
      onClick={() =>
        dispatch(
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
}

export default InfoButton
