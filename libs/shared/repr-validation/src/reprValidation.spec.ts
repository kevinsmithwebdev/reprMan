import { parseRepr, parseReprs } from './index'

describe('reprValidation', () => {
  it('parses a valid repr', () => {
    const parsed = parseRepr({
      id: 'r1',
      title: 'Title',
      categories: ['a'],
      dateCreated: 123,
      datesPracticed: [456],
      comment: 'ok',
    })

    expect(parsed.id).toBe('r1')
    expect(parsed.categories).toEqual(['a'])
  })

  it('throws on invalid repr', () => {
    expect(() => parseRepr({ id: 'r1' })).toThrow()
  })

  it('parses repr arrays', () => {
    const reprs = parseReprs([
      {
        id: 'r1',
        title: 'Title',
        categories: ['a'],
        dateCreated: 123,
        datesPracticed: [456],
        comment: 'ok',
      },
    ])
    expect(reprs).toHaveLength(1)
  })
})
