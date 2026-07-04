import { useL10n } from '@reprman/localization'
import React, { FC } from 'react'
import { Form } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { setCategoryFilterText, useCategories } from '@reprman/state/categories'

export type CategoryFilterTextInputProps = {
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}

const CategoryFilterTextInput: FC<CategoryFilterTextInputProps> = ({
  placeholder,
  className,
  style,
}) => {
  const { t } = useL10n()
  const dispatch = useDispatch()
  const { filter } = useCategories()

  return (
    <Form.Control
      id="category-filter-text-input"
      className={className}
      style={style}
      type="text"
      aria-label={t('components.categoryFilter.titleTextAria')}
      placeholder={
        placeholder ?? t('components.categoryFilter.titleTextPlaceholder')
      }
      value={filter.text}
      onChange={({ target: { value } }) =>
        dispatch(setCategoryFilterText(value))
      }
    />
  )
}

export default CategoryFilterTextInput
