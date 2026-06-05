import moment from 'moment'
import { describe, expect, it } from 'vitest'
import LocalizationModule from '@reprman/localization/Localization.module'

import { _getRateOfPracticedStr, getPracticedStr } from './ViewRepr.helpers'

const t = LocalizationModule.getInstance().t.bind(
  LocalizationModule.getInstance()
)

const getUTCValue = (dateString: string) => moment.utc(dateString).valueOf()

describe('getPracticedStr', () => {
  it('reports when never practiced', () => {
    expect(getPracticedStr([], t)).toBe(t('pages.viewRepr.practice.never'))
  })

  it('reports single practice', () => {
    expect(getPracticedStr([1], t)).toBe(t('pages.viewRepr.practice.once'))
  })

  it('reports identical first and last practice times', () => {
    expect(getPracticedStr([100, 100], t)).toBe(
      t('pages.viewRepr.practice.noDifference')
    )
  })

  it('reports span and rate for multiple distinct practices', () => {
    const dates = [
      getUTCValue('2022-12-01T12:00:00Z'),
      getUTCValue('2022-11-30T15:00:00Z'),
    ]
    const result = getPracticedStr(dates, t)
    expect(result).toContain('2')
    expect(result).toContain('2.29')
  })
})

describe('_getRateOfPracticedStr', () => {
  describe('with bad data', () => {
    it('should return an empty string if no data', () => {
      expect(_getRateOfPracticedStr(undefined, t)).toBe('')
    })

    it('should return an empty string if no dates', () => {
      expect(_getRateOfPracticedStr([], t)).toBe('')
    })

    it('should return an empty string if only one datum', () => {
      const datesPracticed = [getUTCValue('2022-12-01T12:00:00Z')]
      expect(_getRateOfPracticedStr(datesPracticed, t)).toBe('')
    })
  })

  describe('for hour', () => {
    it('should return correct string 2 practices over 59 minutes span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-12-01T11:01:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed, t)).toBe(
        t('pages.viewRepr.practice.ratePerHour', { rate: '2.03' })
      )
    })

    it('should return correct string 3 practices over 20 minutes span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-12-01T11:50:00Z'),
        getUTCValue('2022-12-01T11:40:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed, t)).toBe(
        t('pages.viewRepr.practice.ratePerHour', { rate: '9.00' })
      )
    })

    it('should return correct string 5 practices over 41 minutes span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-12-01T11:50:00Z'),
        getUTCValue('2022-12-01T11:40:00Z'),
        getUTCValue('2022-12-01T11:33:00Z'),
        getUTCValue('2022-12-01T11:29:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed, t)).toBe(
        t('pages.viewRepr.practice.ratePerHour', { rate: '9.68' })
      )
    })
  })

  describe('for day', () => {
    it('should return correct string 2 practices over 21 hour span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-11-30T15:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed, t)).toBe(
        t('pages.viewRepr.practice.ratePerDay', { rate: '2.29' })
      )
    })

    it('should return correct string 6 practices over 20 hour span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-12-01T03:00:00Z'),
        getUTCValue('2022-11-30T19:31:32Z'),
        getUTCValue('2022-11-30T18:00:00Z'),
        getUTCValue('2022-11-30T17:00:00Z'),
        getUTCValue('2022-11-30T16:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed, t)).toBe(
        t('pages.viewRepr.practice.ratePerDay', { rate: '7.20' })
      )
    })
  })

  describe('for month', () => {
    it('should return correct string 2 practices over 17 day span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-11-13T14:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed, t)).toBe(
        t('pages.viewRepr.practice.ratePerMonth', { rate: '3.35' })
      )
    })

    it('should return correct string 10 practices over 26 span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-11-05T29:00:00Z'),
        getUTCValue('2022-11-05T25:00:00Z'),
        getUTCValue('2022-11-05T21:00:00Z'),
        getUTCValue('2022-11-05T20:00:00Z'),
        getUTCValue('2022-11-05T16:00:00Z'),
        getUTCValue('2022-11-05T15:00:00Z'),
        getUTCValue('2022-11-05T14:00:00Z'),
        getUTCValue('2022-11-05T13:00:00Z'),
        getUTCValue('2022-11-05T12:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed, t)).toBe(
        t('pages.viewRepr.practice.ratePerMonth', { rate: '11.54' })
      )
    })
  })

  describe('for year', () => {
    it('should return correct string 2 practices over 214 day span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-05-01T14:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed, t)).toBe(
        t('pages.viewRepr.practice.ratePerYear', { rate: '3.41' })
      )
    })

    it('should return correct string 2 practices over 685 day span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2021-01-15T14:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed, t)).toBe(
        t('pages.viewRepr.practice.ratePerYear', { rate: '1.07' })
      )
    })

    it('should return correct string 4 practices over 595 day span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2021-10-15T14:00:00Z'),
        getUTCValue('2021-08-15T14:00:00Z'),
        getUTCValue('2021-04-15T14:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed, t)).toBe(
        t('pages.viewRepr.practice.ratePerYear', { rate: '2.45' })
      )
    })

    it('should return correct string 2 practices over 1750 day span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2018-02-15T14:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed, t)).toBe(
        t('pages.viewRepr.practice.ratePerYear', { rate: '0.42' })
      )
    })
  })
})
