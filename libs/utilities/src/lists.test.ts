import {
  getComplement,
  getDoesContainsAll,
  getIntersection,
  getUniqueArray,
} from './lists'
import {
  getComplementTestData,
  getDoesContainsAllTestData,
  getIntersectionTestData,
  getUniqueArrayTestData,
} from './lists.testData'

describe('lists', () => {
  describe('getUniqueArray', () => {
    describe.each(getUniqueArrayTestData)(
      'for array %p',
      (arr, expectedReturn) => {
        it(`should return "${JSON.stringify(expectedReturn)}"`, () => {
          expect(getUniqueArray(arr)).toStrictEqual(expectedReturn)
        })
      }
    )
  })

  describe('getComplement', () => {
    describe.each(getComplementTestData)(
      'for array %p and array %p',
      (arr1, arr2, expectedReturn) => {
        it(`should return "${JSON.stringify(expectedReturn)}"`, () => {
          expect(getComplement(arr1, arr2)).toStrictEqual(expectedReturn)
        })
      }
    )
  })

  describe('getIntersection', () => {
    describe.each(getIntersectionTestData)(
      'for array %p and array %p',
      (arr1, arr2, expectedReturn) => {
        it(`should return "${JSON.stringify(expectedReturn)}"`, () => {
          expect(getIntersection(arr1, arr2)).toStrictEqual(expectedReturn)
        })
      }
    )
  })

  describe('getDoesContainsAll', () => {
    describe.each(getDoesContainsAllTestData)(
      'for array %p and array %p',
      (arr1, arr2, expectedReturn) => {
        it(`should return "${JSON.stringify(expectedReturn)}"`, () => {
          expect(getDoesContainsAll(arr1, arr2)).toStrictEqual(expectedReturn)
        })
      }
    )
  })
})
