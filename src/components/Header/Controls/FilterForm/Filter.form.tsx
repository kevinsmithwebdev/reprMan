import React from 'react'
import { Dropdown, Form } from 'react-bootstrap'
import {
  setCategoryFilterCategories,
  setCategoryFilterText,
  useCategories,
} from 'state/categories'
import store from 'state/store'

const FilterForm = () => {
  const { categories } = useCategories()
  const { filter } = useCategories()

  const handleCheckboxChange = (
    _e: React.ChangeEvent<HTMLInputElement>,
    category: string
  ) => {
    const newCategories = filter.categories.slice()
    const index = filter.categories.findIndex((c) => c === category)
    if (index === -1) {
      newCategories.push(category)
    } else {
      newCategories.splice(index, 1)
    }

    store.dispatch(setCategoryFilterCategories(newCategories))
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
    <>
      <Form.Control
        type="title"
        placeholder="filter for title"
        value={filter.text}
        onChange={({ target: { value } }) =>
          store.dispatch(setCategoryFilterText(value))
        }
      />

      <Dropdown.Divider />
      <Form.Group>{categories.map(renderCategoryCheckBox)}</Form.Group>
    </>
  )
}

export default FilterForm
