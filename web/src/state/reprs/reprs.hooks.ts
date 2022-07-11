import {useSelector} from 'react-redux'
import {selectReprs} from './reprs.selectors'

export const useReprs = () => {
  // const dispatch = useDispatch()

  return {
    reprs: useSelector(selectReprs),
    // reprs: (id: number) => dispatch(setSelected(id)),
    // clearSelected: () => dispatch(clearSelected()),
  }
}
