import React, { FC } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import ModalBodyParagraphs from '../common/ModalBodyParagraphs'

export interface ChoiceDatum {
  text: string
  variant?: string
}

export interface ChoiceDatumWithActionType extends ChoiceDatum {
  actionType: string
}

export interface QueryProps {
  closeModal: () => void
  title: string
  body: string[]
  choiceDataWithActionTypes: ChoiceDatumWithActionType[]
}

const QueryChoiceButton: FC<{
  choice: ChoiceDatumWithActionType
  closeModal: () => void
}> = ({ choice, closeModal }) => {
  const dispatch = useDispatch()
  const { text, actionType, variant } = choice

  return (
    <Button
      style={{ flex: 1 }}
      key={text}
      variant={variant || 'primary'}
      onClick={() => {
        dispatch({
          type: actionType,
          payload: actionType,
        })
        closeModal()
      }}
    >
      {text}
    </Button>
  )
}

const Query: FC<QueryProps> = ({
  closeModal,
  title,
  body,
  choiceDataWithActionTypes,
}) => {
  if (choiceDataWithActionTypes.length < 2) return null

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ModalBodyParagraphs lines={body} />
      </Modal.Body>
      <Modal.Footer>
        {choiceDataWithActionTypes.map((choice) => (
          <QueryChoiceButton
            key={choice.text}
            choice={choice}
            closeModal={closeModal}
          />
        ))}
      </Modal.Footer>
    </>
  )
}

export default Query
