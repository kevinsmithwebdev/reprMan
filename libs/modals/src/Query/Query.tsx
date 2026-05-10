import React, { FC } from 'react'
import { Button, Modal } from 'react-bootstrap'
import store from '@reprman/state/store'

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
        {body.map((b: string, idx: number) => {
          const isHeader = b.at(-1) === ':'
          const style = {
            margin: isHeader ? '10px 0' : 0,
            fontWeight: isHeader ? 'bold' : 'normal',
            fontStyle: isHeader ? 'italic' : 'normal',
          }
          return (
            // eslint-disable-next-line react/no-array-index-key
            <p key={`${idx}`} style={style}>
              {b}
            </p>
          )
        })}
      </Modal.Body>
      <Modal.Footer>
        {choiceDataWithActionTypes.map((choiceWithAction) =>
          renderButton(choiceWithAction, closeModal)
        )}
      </Modal.Footer>
    </>
  )
}

export default Query

const renderButton = (
  { text, actionType, variant }: ChoiceDatumWithActionType,
  closeModal: Function
) => (
  <Button
    style={{ flex: 1 }}
    key={text}
    variant={variant || 'primary'}
    onClick={() => {
      store.dispatch({
        type: actionType,
        payload: actionType,
      })
      closeModal()
    }}
  >
    {text}
  </Button>
)
