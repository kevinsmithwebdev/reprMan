import { useSelector } from 'react-redux'
import { selectReprs, selectReprsLoaded } from './reprs.selectors'
import { Repr } from './reprs.types'

export const useReprs = () => {
  const reprs = useSelector(selectReprs)
  const reprsLoaded = useSelector(selectReprsLoaded)
  return {
    reprs,
    reprsLoaded,
    getRepr: (id?: string): Repr | undefined => {
      if (!id) return undefined
      return reprs.find((el) => el.id === id)
    },
  }
}
