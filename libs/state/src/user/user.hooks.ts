import { useSelector } from 'react-redux'
import { selectUser } from './user.selectors'

export const useUser = () => {
  // const dispatch = useDispatch()

  return {
    user: useSelector(selectUser),
    // reprs: (id: number) => dispatch(setSelected(id)),
    // clearSelected: () => dispatch(clearSelected()),
  }
}
