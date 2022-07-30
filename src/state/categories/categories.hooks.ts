import { useSelector } from 'react-redux'
import { selectCategories, selectCategoryFilter } from './categories.selectors'

export const useCategories = () => {
  return {
    categories: useSelector(selectCategories),
    filter: useSelector(selectCategoryFilter),
  }
}
