import {
  ConfirmationModalResponse,
  ModalSelection,
} from 'modals/ModalContainer/ModalContainer.types'
import { put, race, take } from 'redux-saga/effects'
import { setModal } from 'state/modal'

// @ts-ignore
export function* callConfirmation({ title, body }) {
  yield put(
    setModal({
      selection: ModalSelection.CONFIRMATION,
      props: {
        title,
        body,
      },
    })
  )

  const [yesResponse, noResponse] = yield race([
    take(ConfirmationModalResponse.YES),
    take(ConfirmationModalResponse.NO),
  ])

  return yesResponse?.type === ConfirmationModalResponse.YES && !noResponse
}
