import React, { FC } from 'react'

export interface ModalBodyParagraphsProps {
  lines: string[]
}

const ModalBodyParagraphs: FC<ModalBodyParagraphsProps> = ({ lines }) => (
  <>
    {lines.map((line, idx) => {
      const isHeader = line.at(-1) === ':'
      const style = {
        margin: isHeader ? '10px 0' : 0,
        fontWeight: isHeader ? 'bold' : 'normal',
        fontStyle: isHeader ? 'italic' : 'normal',
      }
      return (
        // eslint-disable-next-line react/no-array-index-key
        <p key={`${idx}`} style={style}>
          {line}
        </p>
      )
    })}
  </>
)

export default ModalBodyParagraphs
