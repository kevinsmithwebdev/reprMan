import React, { FC } from 'react'
import { Modal } from 'react-bootstrap'
import ModalBodyParagraphs from '../common/ModalBodyParagraphs'

export interface InfoProps {
  title: string
  body: string[]
}

const Info: FC<InfoProps> = ({ title, body }) => {
  return (
    <>
      <Modal.Header closeButton style={{ backgroundColor: '#e6f2ff' }}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ModalBodyParagraphs lines={body} />
      </Modal.Body>
    </>
  )
}

export default Info
