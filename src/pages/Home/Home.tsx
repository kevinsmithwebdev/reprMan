import React from 'react'
import ReprsList from 'components/ReprsList'
import { useReprs } from 'state/reprs'
import { useCategories } from 'state/categories'
import { CategoryFilter, Reprs } from 'types'
import { getDoesContainsAll } from 'utilities'

const Home = () => {
  const { reprs } = useReprs()
  const { filter } = useCategories()

  const filteredReprs = getFilteredReprs(reprs, filter)
  return (
    <div id="Home-page">
      <ReprsList reprs={filteredReprs} />
    </div>
  )
}

export default Home

const getFilteredReprs = (reprs: Reprs, filter: CategoryFilter) =>
  reprs.filter((r) => {
    const shouldPassForText = r.title
      .toLowerCase()
      .includes(filter.text.toLowerCase())

    const shouldCheckCategories = !!filter.categories.length
    const shouldPassForCategories =
      !shouldCheckCategories ||
      getDoesContainsAll(r.categories, filter.categories)

    return shouldPassForText && shouldPassForCategories
  })
