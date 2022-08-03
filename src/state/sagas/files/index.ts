import readLocalReprsFileWorker from './readLocalReprsFile/readLocalReprsFile.saga'
import writeLocalReprsFileWorker from './writeLocalReprsFile/writeLocalReprsFile.saga'

export default [...readLocalReprsFileWorker, ...writeLocalReprsFileWorker]
