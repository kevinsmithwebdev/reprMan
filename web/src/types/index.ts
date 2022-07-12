type Timestamp = number
type URL = string

export interface Repr {
  id: string
  title: string
  categories?: string[]
  created: Timestamp
  lastPracticed: Timestamp
  // sheetLocation?: URL
  // recordingLocation?: URL
  // tempo?: number
  // meter?: string
  // comment?: string
}

export interface Settings {
  daysOverdueTrigger: 30
}
