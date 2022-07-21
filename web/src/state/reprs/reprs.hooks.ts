import { useSelector } from 'react-redux'
import { selectReprs } from './reprs.selectors'

export const useReprs = () => {
  return {
    reprs: useSelector(selectReprs),
  }
}
