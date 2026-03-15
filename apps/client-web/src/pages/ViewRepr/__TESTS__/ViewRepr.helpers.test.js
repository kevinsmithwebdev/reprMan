import moment from 'moment'
import { _getRateOfPracticedStr } from '../ViewRepr.helpers'

describe('_getRateOfPracticedStr', () => {
  describe('with bad data', () => {
    it('should return an empty string if no data', () => {
      const expectedReturn = ''
      const actualReturn = _getRateOfPracticedStr(undefined)
      expect(actualReturn).toBe(expectedReturn)
    })

    it('should return an empty string if no dates', () => {
      const expectedReturn = ''
      const actualReturn = _getRateOfPracticedStr([])
      expect(actualReturn).toBe(expectedReturn)
    })

    it('should return an empty string if only one datum', () => {
      const expectedReturn = ''
      const datesPracticed = [_getUTCValue('2022-12-01T12:00:00Z')]
      const actualReturn = _getRateOfPracticedStr(datesPracticed)
      expect(actualReturn).toBe(expectedReturn)
    })
  })

  describe('for hour', () => {
    it('should return correct string 2 practices over 59 minutes span', () => {
      const expectedReturn = '2.03 times per hour'
      const datesPracticed = [
        _getUTCValue('2022-12-01T12:00:00Z'),
        _getUTCValue('2022-12-01T11:01:00Z'),
      ]
      const actualReturn = _getRateOfPracticedStr(datesPracticed)
      expect(actualReturn).toBe(expectedReturn)
    })

    it('should return correct string 3 practices over 20 minutes span', () => {
      const expectedReturn = '9.00 times per hour'
      const datesPracticed = [
        _getUTCValue('2022-12-01T12:00:00Z'),
        _getUTCValue('2022-12-01T11:50:00Z'),
        _getUTCValue('2022-12-01T11:40:00Z'),
      ]
      const actualReturn = _getRateOfPracticedStr(datesPracticed)
      expect(actualReturn).toBe(expectedReturn)
    })

    it('should return correct string 5 practices over 41 minutes span', () => {
      const expectedReturn = '9.68 times per hour'
      const datesPracticed = [
        _getUTCValue('2022-12-01T12:00:00Z'),
        _getUTCValue('2022-12-01T11:50:00Z'),
        _getUTCValue('2022-12-01T11:40:00Z'),
        _getUTCValue('2022-12-01T11:33:00Z'),
        _getUTCValue('2022-12-01T11:29:00Z'),
      ]
      const actualReturn = _getRateOfPracticedStr(datesPracticed)
      expect(actualReturn).toBe(expectedReturn)
    })
  })

  describe('for day', () => {
    it('should return correct string 2 practices over 21 hour span', () => {
      const expectedReturn = '2.29 times per day'
      const datesPracticed = [
        _getUTCValue('2022-12-01T12:00:00Z'),
        _getUTCValue('2022-11-30T15:00:00Z'),
      ]
      const actualReturn = _getRateOfPracticedStr(datesPracticed)
      expect(actualReturn).toBe(expectedReturn)
    })

    it('should return correct string 6 practices over 20 hour span', () => {
      const expectedReturn = '7.20 times per day'
      const datesPracticed = [
        _getUTCValue('2022-12-01T12:00:00Z'),
        _getUTCValue('2022-12-01T03:00:00Z'),
        _getUTCValue('2022-11-30T19:31:32Z'),
        _getUTCValue('2022-11-30T18:00:00Z'),
        _getUTCValue('2022-11-30T17:00:00Z'),
        _getUTCValue('2022-11-30T16:00:00Z'),
      ]
      const actualReturn = _getRateOfPracticedStr(datesPracticed)
      expect(actualReturn).toBe(expectedReturn)
    })
  })

  describe('for month', () => {
    it('should return correct string 2 practices over 17 day span', () => {
      const expectedReturn = '3.35 times per month'
      const datesPracticed = [
        _getUTCValue('2022-12-01T12:00:00Z'),
        _getUTCValue('2022-11-13T14:00:00Z'),
      ]
      const actualReturn = _getRateOfPracticedStr(datesPracticed)
      expect(actualReturn).toBe(expectedReturn)
    })

    it('should return correct string 10 practices over 26 span', () => {
      const expectedReturn = '11.54 times per month'
      const datesPracticed = [
        _getUTCValue('2022-12-01T12:00:00Z'),
        _getUTCValue('2022-11-05T29:00:00Z'),
        _getUTCValue('2022-11-05T25:00:00Z'),
        _getUTCValue('2022-11-05T21:00:00Z'),
        _getUTCValue('2022-11-05T20:00:00Z'),
        _getUTCValue('2022-11-05T16:00:00Z'),
        _getUTCValue('2022-11-05T15:00:00Z'),
        _getUTCValue('2022-11-05T14:00:00Z'),
        _getUTCValue('2022-11-05T13:00:00Z'),
        _getUTCValue('2022-11-05T12:00:00Z'),
      ]
      const actualReturn = _getRateOfPracticedStr(datesPracticed)
      expect(actualReturn).toBe(expectedReturn)
    })
  })

  describe('for year', () => {
    it('should return correct string 2 practices over 214 day span', () => {
      const expectedReturn = '3.41 times per year'
      const datesPracticed = [
        _getUTCValue('2022-12-01T12:00:00Z'),
        _getUTCValue('2022-05-01T14:00:00Z'),
      ]
      const actualReturn = _getRateOfPracticedStr(datesPracticed)
      expect(actualReturn).toBe(expectedReturn)
    })

    it('should return correct string 2 practices over 685 day span', () => {
      const expectedReturn = '1.07 times per year'
      const datesPracticed = [
        _getUTCValue('2022-12-01T12:00:00Z'),
        _getUTCValue('2021-01-15T14:00:00Z'),
      ]
      const actualReturn = _getRateOfPracticedStr(datesPracticed)
      expect(actualReturn).toBe(expectedReturn)
    })

    it('should return correct string 4 practices over 595 day span', () => {
      const expectedReturn = '2.45 times per year'
      const datesPracticed = [
        _getUTCValue('2022-12-01T12:00:00Z'),
        _getUTCValue('2021-10-15T14:00:00Z'),
        _getUTCValue('2021-08-15T14:00:00Z'),
        _getUTCValue('2021-04-15T14:00:00Z'),
      ]
      const actualReturn = _getRateOfPracticedStr(datesPracticed)
      expect(actualReturn).toBe(expectedReturn)
    })

    it('should return correct string 2 practices over 1750 day span', () => {
      const expectedReturn = '0.42 times per year'
      const datesPracticed = [
        _getUTCValue('2022-12-01T12:00:00Z'),
        _getUTCValue('2018-02-15T14:00:00Z'),
      ]
      const actualReturn = _getRateOfPracticedStr(datesPracticed)
      expect(actualReturn).toBe(expectedReturn)
    })
  })
})

const _getUTCValue = (dateString) => moment.utc(dateString).valueOf()
