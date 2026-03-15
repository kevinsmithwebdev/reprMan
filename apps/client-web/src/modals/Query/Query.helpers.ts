import { ModalSelection } from 'modals/ModalContainer/ModalContainer.types'
import { put, race, take } from 'redux-saga/effects'
import { setModal } from 'state/modal'
import { ChoiceDatum, ChoiceDatumWithActionType } from './Query'

export function* callQuery({
  title,
  body,
  choiceData,
}: {
  title: string
  body: string[]
  choiceData: ChoiceDatum[]
}) {
  const choiceDataWithActionTypes = choiceData.map(
    (c: ChoiceDatum, idx: number) => ({
      text: c.text,
      variant: c.variant,
      actionType: generateType(idx),
    })
  ) as ChoiceDatumWithActionType[]

  yield put(
    setModal({
      selection: ModalSelection.QUERY,
      props: {
        title,
        body,
        choiceDataWithActionTypes,
      },
    })
  )

  const [...responses] = yield race(
    choiceDataWithActionTypes.map((o) => take(o.actionType))
  )

  return responses.findIndex((r: any) => !!r)
}

const SLUG = 'MODAL/QUERY'
const generateType = (idx: number) => `${SLUG}_${idx}`
