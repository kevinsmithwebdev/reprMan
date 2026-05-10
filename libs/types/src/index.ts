export type { Repr, Reprs } from '@reprman/shared/repr-model'

export interface Settings {
  practiceDelay: number
  warningRatio: number
}

export type Categories = string[]

export interface CategoryFilter {
  text: string
  categories: string[]
}

export enum ToastLevel {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  INFO = 'INFO',
  WARNING = 'WARNING',
}

export interface ToastRequest {
  title?: string
  body: string
  level?: ToastLevel
  delay?: number
}

export interface ToastData extends ToastRequest {
  id: string
}
