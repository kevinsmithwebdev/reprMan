import React from 'react'
import { useReprs } from 'state/reprs'
import Reprs from 'components/Reprs'

const Home = () => {
  const { reprs } = useReprs()

  return (
    <div>
      <Reprs reprs={reprs} />
    </div>
  )
}

export default Home
