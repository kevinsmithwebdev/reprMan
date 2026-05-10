import { createAction } from '@reduxjs/toolkit'
import { Categories, CategoryFilter } from '@reprman/types'
import { NAMESPACE } from './categories.constants'

export const setCategories = createAction<Categories>(`${NAMESPACE}/SET`)
export const clearCategories = createAction(`${NAMESPACE}/CLEAR`)

export const setCategoryFilter = createAction<CategoryFilter>(
  `${NAMESPACE}/SET_CATEGORY_FILTER`
)
export const clearCategoryFilter = createAction(
  `${NAMESPACE}/CLEAR_CATEGORY_FILTER`
)

export const setCategoryFilterText = createAction<string>(
  `${NAMESPACE}/SET_CATEGORY_FILTER_TEXT`
)
export const clearCategoryFilterText = createAction(
  `${NAMESPACE}/CLEAR_CATEGORY_FILTER_TEXT`
)

export const setCategoryFilterCategories = createAction<string[]>(
  `${NAMESPACE}/SET_CATEGORY_FILTER_CATEGORIES`
)
export const clearCategoryFilterCategories = createAction(
  `${NAMESPACE}/CLEAR_CATEGORY_FILTER_CATEGORIES`
)

export const clearAllCategoryData = createAction(
  `${NAMESPACE}/CLEAR_ALL_CATEGORY_DATA`
)
