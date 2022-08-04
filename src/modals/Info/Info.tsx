import React, { FC } from 'react'
import { Modal } from 'react-bootstrap'

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
    </>
  )
}

export default Info
