import moment from 'moment'
import {
  isWithinPracticeCooldown,
  PRACTICE_COOLDOWN_MS,
} from '@reprman/shared/repr-rules'
import { Repr } from '@reprman/types'
import {
  dangerReturn,
  getReprColors,
  getReprColorsForRepr,
  learningReturn,
  successReturn,
  warningReturn,
} from './ReprLine.helpers'

const BASE_DATE = '2020-12-31'

const SECONDS_IN_A_DAY = 86400

const getDaysAgoTS = (days: number) =>
  moment()
    .utc()
    .subtract(days * SECONDS_IN_A_DAY, 'seconds')
    .valueOf()

describe('isWithinPracticeCooldown', () => {
  it('is true when practiced less than a minute ago', () => {
    const now = 1_000_000
    expect(
      isWithinPracticeCooldown([now - 30_000], PRACTICE_COOLDOWN_MS, now)
    ).toBe(true)
  })

  it('is false when practiced more than a minute ago', () => {
    const now = 1_000_000
    expect(
      isWithinPracticeCooldown([now - 90_000], PRACTICE_COOLDOWN_MS, now)
    ).toBe(false)
  })

  it('is false when never practiced', () => {
    expect(isWithinPracticeCooldown([])).toBe(false)
  })
})

describe('ReprLine.helpers', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(BASE_DATE))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('getReprColors', () => {
    const mockSettings = { practiceDelay: 40, warningRatio: 0.75 }

    it('returns learning gray for learning reprs', () => {
      const learningRepr: Repr = {
        id: '1',
        title: 't',
        categories: [],
        dateCreated: 0,
        datesPracticed: [getDaysAgoTS(100)],
        comment: '',
        learning: true,
      }
      expect(getReprColorsForRepr(learningRepr, mockSettings)).toStrictEqual(
        learningReturn
      )
    })

    describe('for 0 days ago', () => {
      const daysPassed = 0
      const actualReturn = getReprColors(getDaysAgoTS(daysPassed), mockSettings)
      it('should return success object', () => {
        expect(actualReturn).toStrictEqual(successReturn)
      })
    })

    describe('for halfway between now and warning', () => {
      const daysPassed =
        (mockSettings.practiceDelay * mockSettings.warningRatio) / 2
      const actualReturn = getReprColors(getDaysAgoTS(daysPassed), mockSettings)
      it('should return success object', () => {
        expect(actualReturn).toStrictEqual(successReturn)
      })
    })

    describe('for on the warning', () => {
      const daysPassed = mockSettings.practiceDelay * mockSettings.warningRatio
      const actualReturn = getReprColors(getDaysAgoTS(daysPassed), mockSettings)
      it('should return success object', () => {
        expect(actualReturn).toStrictEqual(successReturn)
      })
    })

    describe('for halfway between warning and danger', () => {
      const fullPracticeDelay = mockSettings.practiceDelay
      const fullWarning = mockSettings.practiceDelay * mockSettings.warningRatio
      const daysPassed = (fullPracticeDelay + fullWarning) / 2
      const actualReturn = getReprColors(getDaysAgoTS(daysPassed), mockSettings)
      it('should return warning object', () => {
        expect(actualReturn).toStrictEqual(warningReturn)
      })
    })

    describe('for on the danger', () => {
      const daysPassed = mockSettings.practiceDelay
      const actualReturn = getReprColors(getDaysAgoTS(daysPassed), mockSettings)
      it('should return warning object', () => {
        expect(actualReturn).toStrictEqual(warningReturn)
      })
    })

    describe('for just passed the danger', () => {
      const daysPassed = mockSettings.practiceDelay * 1.00001
      const actualReturn = getReprColors(getDaysAgoTS(daysPassed), mockSettings)
      it('should return danger object', () => {
        expect(actualReturn).toStrictEqual(dangerReturn)
      })
    })

    describe('for 10 days passed the danger', () => {
      const daysPassed = mockSettings.practiceDelay + 10
      const actualReturn = getReprColors(getDaysAgoTS(daysPassed), mockSettings)
      it('should return danger object', () => {
        expect(actualReturn).toStrictEqual(dangerReturn)
      })
    })

    describe('for 100 days passed the danger', () => {
      const daysPassed = mockSettings.practiceDelay + 100
      const actualReturn = getReprColors(getDaysAgoTS(daysPassed), mockSettings)
      it('should return danger object', () => {
        expect(actualReturn).toStrictEqual(dangerReturn)
      })
    })

    describe('for 1000 days passed the danger', () => {
      const daysPassed = mockSettings.practiceDelay + 1000
      const actualReturn = getReprColors(getDaysAgoTS(daysPassed), mockSettings)
      it('should return danger object', () => {
        expect(actualReturn).toStrictEqual(dangerReturn)
      })
    })
  })
})
