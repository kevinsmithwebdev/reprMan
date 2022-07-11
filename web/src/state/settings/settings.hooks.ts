import {useSelector} from 'react-redux'
import {selectSettings} from './settings.selectors'

export const useSettings = () => {
  // const dispatch = useDispatch()

  return {
    settings: useSelector(selectSettings),
    // reprs: (id: number) => dispatch(setSelected(id)),
    // clearSelected: () => dispatch(clearSelected()),
  }
}
