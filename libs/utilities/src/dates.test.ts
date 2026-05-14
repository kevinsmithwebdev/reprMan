import moment from 'moment'
import { getDateAndFrom, getDateDiffText } from './dates'
import {
  getDateAndFromTestData,
  getDateDiffTextTestData,
} from './dates.testData'

const BASE_DATE = '2020-12-31'

describe(`dates, Date mocked to ${BASE_DATE}`, () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(BASE_DATE))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('getDateAndFrom', () => {
    describe.each(getDateAndFromTestData)('for %d seconds ago', (amount) => {
      it('should return formatted date and relative time', () => {
        const mockTimeCode = moment()
          .utc()
          .subtract(amount, 'seconds')
          .valueOf()
        const actualReturn = getDateAndFrom(mockTimeCode)
        const m = moment(mockTimeCode)
        const expected = `${m.format('MMMM Do YYYY, h:mm A')}, ${m.fromNow()}`
        expect(actualReturn).toBe(expected)
      })
    })
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

    describe.each(getDateDiffTextTestData)(
      `for TC for ${BASE_DATE} and delta of %d ms`,
      (delta, expectedReturn) => {
        it(`should return "${expectedReturn}"`, () => {
          const mockFirst = moment().utc().valueOf()
          const actualReturn = getDateDiffText(mockFirst, mockFirst + delta)
          expect(actualReturn).toBe(expectedReturn)
        })
      }
    )
  })
})
