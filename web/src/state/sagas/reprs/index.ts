import addReprWorker from './addRepr/addRepr.saga'
import loadReprsWorker from './loadReprs/loadReprs.saga'
import clearAllReprsWorker from './clearAllReprs/clearAllReprs.saga'
import removeReprWorker from './removeRepr/removeRepr.saga'
import markReprPracticedWorker from './markReprPracticed/markReprPracticed.saga'

export default [
  ...addReprWorker,
  ...loadReprsWorker,
  ...clearAllReprsWorker,
  ...removeReprWorker,
  ...markReprPracticedWorker,
]
