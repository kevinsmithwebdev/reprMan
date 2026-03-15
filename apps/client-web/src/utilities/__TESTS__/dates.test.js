import moment from 'moment'
import { getDateAndFrom, getDateDiffText } from '..'
import {
  getDateAndFromTestData,
  getDateDiffTextTestData,
} from './dates.testData'

const BASE_DATE = '2020-12-31'
jest.useFakeTimers().setSystemTime(new Date(BASE_DATE))

describe(`dates, Date mocked to ${BASE_DATE}`, () => {
  describe('getDateAndFrom', () => {
    describe.each(getDateAndFromTestData)(
      'for %d seconds ago',
      (amount, expectedReturn) => {
        const mockTimeCode = moment()
          .utc()
          .subtract(amount, 'seconds')
          .valueOf()
        const actualReturn = getDateAndFrom(mockTimeCode)
        it(`should return "${expectedReturn}"`, () => {
          expect(actualReturn).toBe(expectedReturn)
        })
      }
    )
  })

  describe('getDateDiffText', () => {
    describe('with no first', () => {
      it('should return and empty string', () => {
        expect(getDateDiffText(undefined, 123)).toBe('')
      })
    })

    describe('with no last', () => {
      it('should return and empty string', () => {
        expect(getDateDiffText(123, undefined)).toBe('')
      })
    })

    describe('with first = last', () => {
      const num = 123
      it('should return and empty string', () => {
        expect(getDateDiffText(num, num)).toBe('')
      })
    })

    const mockFirst = moment().utc().valueOf()
    describe.each(getDateDiffTextTestData)(
      `for TC for ${BASE_DATE} and delta of %d ms`,
      (delta, expectedReturn) => {
        const actualReturn = getDateDiffText(mockFirst, mockFirst + delta)
        it(`should return "${expectedReturn}"`, () => {
          expect(actualReturn).toBe(expectedReturn)
        })
      }
    )
  })
})
