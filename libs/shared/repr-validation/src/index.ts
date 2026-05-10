import type { Repr } from '@reprman/shared/repr-model'

const assertString = (value: unknown, field: string): string => {
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${field}`)
  }
  return value
}

const assertNumber = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid ${field}`)
  }
  return value
}

const assertStringArray = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`Invalid ${field}`)
  }
  return value
}

const assertNumberArray = (value: unknown, field: string): number[] => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'number')) {
    throw new Error(`Invalid ${field}`)
  }
  return value
}

export const parseRepr = (value: unknown): Repr => {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid repr payload')
  }

  const input = value as Record<string, unknown>
  return {
    id: assertString(input.id, 'id'),
    title: assertString(input.title, 'title'),
    categories: assertStringArray(input.categories, 'categories'),
    dateCreated: assertNumber(input.dateCreated, 'dateCreated'),
    datesPracticed: assertNumberArray(input.datesPracticed, 'datesPracticed'),
    comment: assertString(input.comment, 'comment'),
  }
}

export const parseReprs = (value: unknown): Repr[] => {
  if (!Array.isArray(value)) {
    throw new Error('Payload must be an array')
  }
  return value.map(parseRepr)
}
