import { describe, expect, it } from 'vitest'

import { _getRateOfPracticedStr, getPracticedStr } from './ViewRepr.helpers'

const t = (key: string, props?: object) =>
  props ? `${key}:${JSON.stringify(props)}` : key

describe('ViewRepr.helpers', () => {
  it('describes practice history states', () => {
    expect(getPracticedStr([], t)).toBe('pages.viewRepr.practice.never')
    expect(getPracticedStr([1000], t)).toBe('pages.viewRepr.practice.once')
    expect(getPracticedStr([1000, 1000], t)).toBe(
      'pages.viewRepr.practice.noDifference'
    )
    expect(getPracticedStr([1000, 2000, 3000], t)).toContain(
      'pages.viewRepr.practice.summary'
    )
  })

  it('formats practice rate strings by elapsed time', () => {
    const hourSpan = [Date.UTC(2024, 0, 1, 10, 30), Date.UTC(2024, 0, 1, 10)]
    expect(_getRateOfPracticedStr(hourSpan, t)).toContain('ratePerHour')

    const daySpan = [Date.UTC(2024, 0, 1, 18), Date.UTC(2024, 0, 1, 6)]
    expect(_getRateOfPracticedStr(daySpan, t)).toContain('ratePerDay')

    const monthSpan = [Date.UTC(2024, 0, 16), Date.UTC(2024, 0, 1)]
    expect(_getRateOfPracticedStr(monthSpan, t)).toContain('ratePerMonth')

    const yearSpan = [Date.UTC(2025, 0, 1), Date.UTC(2024, 0, 1)]
    expect(_getRateOfPracticedStr(yearSpan, t)).toContain('ratePerYear')

    expect(_getRateOfPracticedStr([], t)).toBe('')
    expect(_getRateOfPracticedStr([1000, 1000], t)).toBe('')
  })
})
