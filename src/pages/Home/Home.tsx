import React from 'react'
import ReprsList from 'components/ReprsList'
import AddReprButton from 'components/AddReprButton'
import { useReprs } from 'state/reprs'

const MIN_REPRS_TO_SHOW_TOP_ADD_BUTTON = 7

const Home = () => {
  const { reprs } = useReprs()
  const shouldShowTopAddButton =
    reprs.length >= MIN_REPRS_TO_SHOW_TOP_ADD_BUTTON
  return (
    <>
      {shouldShowTopAddButton && <AddReprButton />}

      <ReprsList reprs={reprs} />

      <AddReprButton />
    </>
  )
}

export default Home
