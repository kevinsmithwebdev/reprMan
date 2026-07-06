import React, { FC } from 'react'
import {
  ModalBody,
  ModalHeader,
  ModalTitle,
} from '../common/BootstrapModalParts'
import ModalBodyParagraphs from '../common/ModalBodyParagraphs'

export interface InfoProps {
  title: string
  body: string[]
}

const Info: FC<InfoProps> = ({ title, body }) => {
  return (
    <>
      <ModalHeader closeButton style={{ backgroundColor: '#e6f2ff' }}>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <ModalBodyParagraphs lines={body} />
      </ModalBody>
    </>
  )
}

export default Info
