import { useSelector } from 'react-redux'
import { selectReprs } from './reprs.selectors'
import { Repr } from './reprs.types'

export const useReprs = () => {
  const reprs = useSelector(selectReprs)
  return {
    reprs,
    // FIXME: use own selector
    getRepr: (id: string) => (reprs.find((el) => el.id === id) || {}) as Repr,
  }
}
