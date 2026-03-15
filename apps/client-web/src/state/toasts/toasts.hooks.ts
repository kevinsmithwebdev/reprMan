import { useSelector } from 'react-redux'
import { selectToasts } from './toasts.selectors'

export const useToasts = () => ({
  toasts: useSelector(selectToasts),
})
