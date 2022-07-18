export interface Repr {
  id: string
  title: string
  categories: string[]
  dateCreated: number
  datesPracticed: number[]
  comment: string
}

export type Reprs = Repr[]

export interface Settings {
  daysOverdueTrigger: 30
}

export type Categories = string[]
