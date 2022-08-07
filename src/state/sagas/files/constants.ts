export const DEFAULT_REPRS_TEXT_FILENAME = 'reprsData.txt'

export const TITLE_OFFSET = 0
export const CATEGORIES_OFFSET = 1
export const COMMENT_OFFSET = 2
export const DATE_CREATED_OFFSET = 3
export const DATE_PRACTICED_OFFSET = 4
export const ID_OFFSET = 5
export const DELIMITER_OFFSET = 6

export const FILE_LINE_DELIMITER = '*'
export const FILE_REPR_DELIMITER = '***'

// *** files types

export interface FileType {
  description: string
  accept: {
    [key: string]: string[]
  }
}

export const TEXT_FILE_TYPES = [
  {
    description: 'Text Files',
    accept: {
      'text/plain': ['.txt'],
    },
  },
]

export const XLSX_FILE_TYPES = [
  {
    description: 'Spreadsheet Files',
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
        '.xls',
      ],
    },
  },
]
