export interface Repr {
  id: string
  title: string
  categories: string[]
  dateCreated: number
  datesPracticed: number[]
  comment: string
  learning: boolean
}

export type Reprs = Repr[]
