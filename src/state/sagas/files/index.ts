import readReprsFromTextFileWorker from './readReprsFromTextFile/readReprsFromTextFile.saga'
import writeReprsToTextFileWorker from './writeReprsToTextFile/writeReprsToTextFile.saga'

import readReprsFromXlsxFile from './readReprsFromXlsxFile/readReprsFromXlsxFile.saga'
import writeReprsToXlsxFileWorker from './writeReprsToXlsxFile/writeReprsToXlsxFile.saga'

export default [
  ...readReprsFromTextFileWorker,
  ...writeReprsToTextFileWorker,

  ...readReprsFromXlsxFile,
  ...writeReprsToXlsxFileWorker,
]
