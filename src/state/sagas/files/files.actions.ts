export const READ_REPRS_FROM_TEXT_FILE = 'SAGA/READ_REPRS_FROM_TEXT_FILE'
export const WRITE_REPRS_TO_TEXT_FILE = 'SAGA/WRITE_REPRS_TO_TEXT_FILE'

export const READ_REPRS_FROM_XLSX_FILE = 'SAGA/READ_REPRS_FROM_XLSX_FILE'
export const WRITE_REPRS_TO_XLSX_FILE = 'SAGA/WRITE_REPRS_TO_XLSX_FILE'

export const readReprsFromTextFileSAC = () => ({
  type: READ_REPRS_FROM_TEXT_FILE,
})
export const writeReprsToTextFileSAC = () => ({
  type: WRITE_REPRS_TO_TEXT_FILE,
})

export const readReprsFromXlsxFileSAC = () => ({
  type: READ_REPRS_FROM_XLSX_FILE,
})
export const writeReprsToXlsxFileSAC = () => ({
  type: WRITE_REPRS_TO_XLSX_FILE,
})
