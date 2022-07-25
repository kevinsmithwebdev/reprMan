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
  practiceDelay: number
  warningRatio: number
}

export type Categories = string[]
