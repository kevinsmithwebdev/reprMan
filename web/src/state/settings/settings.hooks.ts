import { useSelector } from 'react-redux'
import { selectSettings } from './settings.selectors'

export const useSettings = () => ({
  settings: useSelector(selectSettings),
})
