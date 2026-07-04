import React from 'react'
import { Form } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import {
  setCategoryFilterCategories,
  useCategories,
} from '@reprman/state/categories'

const FilterForm = () => {
  const dispatch = useDispatch()
  const { categories } = useCategories()
  const { filter } = useCategories()

  const handleCheckboxChange = (
    _e: React.ChangeEvent<HTMLInputElement>,
    category: string
  ) => {
    const newCategories = filter.categories.slice()
    const index = filter.categories.indexOf(category)
    if (index === -1) {
      newCategories.push(category)
    } else {
      newCategories.splice(index, 1)
    }

    dispatch(setCategoryFilterCategories(newCategories))
  }

  const renderCategoryCheckBox = (category: string) => (
    <Form.Check
      checked={filter.categories.includes(category)}
      id={category}
      key={category}
      label={category}
      value={+categories.includes(category)}
      onChange={(e) => handleCheckboxChange(e, category)}
    />
  )

  return (
    <div id="filter-form">
      <Form.Group>{categories.map(renderCategoryCheckBox)}</Form.Group>
    </div>
  )
}

export default FilterForm
