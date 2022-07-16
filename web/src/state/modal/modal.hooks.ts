import { useSelector } from 'react-redux'
import { selectModal } from './modal.selectors'

export const useModal = () => ({
  ...useSelector(selectModal),
})
