import moment from 'moment'
import { describe, expect, it } from 'vitest'

import { _getRateOfPracticedStr, getPracticedStr } from './ViewRepr.helpers'

const getUTCValue = (dateString: string) => moment.utc(dateString).valueOf()

describe('getPracticedStr', () => {
  it('reports when never practiced', () => {
    expect(getPracticedStr([])).toBe('You have not practiced this repr.')
  })

  it('reports single practice', () => {
    expect(getPracticedStr([1])).toBe('You have only practiced this repr once.')
  })

  it('reports identical first and last practice times', () => {
    expect(getPracticedStr([100, 100])).toBe(
      'There is no difference in your practice times.'
    )
  })

  it('reports span and rate for multiple distinct practices', () => {
    const dates = [
      getUTCValue('2022-12-01T12:00:00Z'),
      getUTCValue('2022-11-30T15:00:00Z'),
    ]
    const result = getPracticedStr(dates)
    expect(result).toContain('You have practiced this repr 2 times')
    expect(result).toContain('times per')
  })
})

describe('_getRateOfPracticedStr', () => {
  describe('with bad data', () => {
    it('should return an empty string if no data', () => {
      expect(_getRateOfPracticedStr(undefined)).toBe('')
    })

    it('should return an empty string if no dates', () => {
      expect(_getRateOfPracticedStr([])).toBe('')
    })

    it('should return an empty string if only one datum', () => {
      const datesPracticed = [getUTCValue('2022-12-01T12:00:00Z')]
      expect(_getRateOfPracticedStr(datesPracticed)).toBe('')
    })
  })

  describe('for hour', () => {
    it('should return correct string 2 practices over 59 minutes span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-12-01T11:01:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed)).toBe('2.03 times per hour')
    })

    it('should return correct string 3 practices over 20 minutes span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-12-01T11:50:00Z'),
        getUTCValue('2022-12-01T11:40:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed)).toBe('9.00 times per hour')
    })

    it('should return correct string 5 practices over 41 minutes span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-12-01T11:50:00Z'),
        getUTCValue('2022-12-01T11:40:00Z'),
        getUTCValue('2022-12-01T11:33:00Z'),
        getUTCValue('2022-12-01T11:29:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed)).toBe('9.68 times per hour')
    })
  })

  describe('for day', () => {
    it('should return correct string 2 practices over 21 hour span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-11-30T15:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed)).toBe('2.29 times per day')
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
      expect(_getRateOfPracticedStr(datesPracticed)).toBe('7.20 times per day')
    })
  })

  describe('for month', () => {
    it('should return correct string 2 practices over 17 day span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-11-13T14:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed)).toBe(
        '3.35 times per month'
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
      expect(_getRateOfPracticedStr(datesPracticed)).toBe(
        '11.54 times per month'
      )
    })
  })

  describe('for year', () => {
    it('should return correct string 2 practices over 214 day span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2022-05-01T14:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed)).toBe('3.41 times per year')
    })

    it('should return correct string 2 practices over 685 day span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2021-01-15T14:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed)).toBe('1.07 times per year')
    })

    it('should return correct string 4 practices over 595 day span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2021-10-15T14:00:00Z'),
        getUTCValue('2021-08-15T14:00:00Z'),
        getUTCValue('2021-04-15T14:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed)).toBe('2.45 times per year')
    })

    it('should return correct string 2 practices over 1750 day span', () => {
      const datesPracticed = [
        getUTCValue('2022-12-01T12:00:00Z'),
        getUTCValue('2018-02-15T14:00:00Z'),
      ]
      expect(_getRateOfPracticedStr(datesPracticed)).toBe('0.42 times per year')
    })
  })
})
