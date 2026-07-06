import React, { FC } from 'react'
import { Button } from 'react-bootstrap'
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '../common/BootstrapModalParts'
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
      <ModalHeader closeButton>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <ModalBodyParagraphs lines={body} />
      </ModalBody>
      <ModalFooter>
        {choiceDataWithActionTypes.map((choice) => (
          <QueryChoiceButton
            key={choice.text}
            choice={choice}
            closeModal={closeModal}
          />
        ))}
      </ModalFooter>
    </>
  )
}

export default Query
