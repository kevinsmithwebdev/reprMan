import { useSelector } from 'react-redux'
import { selectCategories } from './categories.selectors'

export const useCategories = () => {
  return {
    categories: useSelector(selectCategories),
  }
}
