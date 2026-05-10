import addReprWorker from './addRepr/addRepr.saga'
import loadReprsWorker from './loadReprs/loadReprs.saga'
import clearAllReprsWorker from './clearAllReprs/clearAllReprs.saga'
import removeReprWorker from './removeRepr/removeRepr.saga'
import markReprPracticedWorker from './markReprPracticed/markReprPracticed.saga'
import storeReprsWorker from './storeReprs/storeReprs.saga'

export default [
  ...addReprWorker,
  ...clearAllReprsWorker,
  ...loadReprsWorker,
  ...markReprPracticedWorker,
  ...removeReprWorker,
  ...storeReprsWorker,
]
