import React, { FC } from 'react'
import Repr from 'components/Repr'
import { ReprsProps } from './Reprs.types'

const Reprs: FC<ReprsProps> = ({ reprs }) => {
  return (
    <div>
      {reprs.map((r) => (
        <Repr key={r.id} repr={r} />
      ))}
    </div>
  )
}

export default Reprs

// const styles = {
//   card: {
//     margin: '20px',
//     padding: '5px',
//     borderRadius: '5px',
//     boxShadow: '0.5px 1px 1px 2px #eee',
//   },
// }
