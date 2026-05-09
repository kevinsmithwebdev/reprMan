import { useSelector } from 'react-redux'
import {
  selectQuotaLoaded,
  selectReprCreationCapWhenLoaded,
} from './reprsQuota.selectors'

export const useReprCreationCap = () => ({
  quotaLoaded: useSelector(selectQuotaLoaded),
  reprCreationCap: useSelector(selectReprCreationCapWhenLoaded),
})
