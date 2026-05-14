import { useL10n } from '@reprman/localization'
import React, { FC } from 'react'
import { Form } from 'react-bootstrap'
import {
  setCategoryFilterText,
  useCategories,
} from '@reprman/state/categories'
import store from '@reprman/state/store'

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
        store.dispatch(setCategoryFilterText(value))
      }
    />
  )
}

export default CategoryFilterTextInput
