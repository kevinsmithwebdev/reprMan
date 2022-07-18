import { useSelector } from 'react-redux'
import { selectCategories, selectReprs } from './reprs.selectors'

export const useReprs = () => {
  // const dispatch = useDispatch()

  return {
    reprs: useSelector(selectReprs),
    categories: useSelector(selectCategories),
  }
}
