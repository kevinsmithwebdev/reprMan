import { ModalSelection } from 'modals/ModalContainer/ModalContainer.types'

export interface Modal {
  selection: ModalSelection | null
  props: Object | null
}
