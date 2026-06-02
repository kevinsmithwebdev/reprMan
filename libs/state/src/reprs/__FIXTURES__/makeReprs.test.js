import { describe, expect, it, vi } from 'vitest'
import { generateMockReprs } from './makeReprs'
import preData from './preData'

describe('makeReprs fixtures', () => {
  it('exports preData entries', () => {
    expect(preData.length).toBeGreaterThan(0)
    expect(preData[0]).toHaveProperty('title')
  })

  it('generates repr fixtures for a day range', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.UTC(2024, 5, 15, 12, 0, 0))

    const reprs = generateMockReprs(0, [
      { title: 'Test', categories: ['jazz'], comment: 'note' },
    ])

    expect(reprs).toHaveLength(1)
    expect(reprs[0]).toMatchObject({
      id: 'id-0',
      title: 'Test',
      categories: ['jazz'],
      comment: 'note',
    })
    expect(reprs[0].datesPracticed).toHaveLength(1)
  })

  it('rejects invalid numDays', () => {
    expect(() => generateMockReprs(-1)).toThrow(/numDays/)
    expect(() => generateMockReprs(1.5)).toThrow(/numDays/)
  })

  it('returns fixtures for all preData rows when numDays is zero', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.UTC(2024, 5, 15, 12, 0, 0))
    expect(generateMockReprs(0)).toHaveLength(preData.length)
  })
})
