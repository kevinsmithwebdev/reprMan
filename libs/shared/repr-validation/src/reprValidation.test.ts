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
    expect(parsed.learning).toBe(false)
  })

  it('parses learning true when set', () => {
    const parsed = parseRepr({
      id: 'r1',
      title: 'Title',
      categories: [],
      dateCreated: 123,
      datesPracticed: [],
      comment: '',
      learning: true,
    })

    expect(parsed.learning).toBe(true)
  })

  it('defaults learning to false when omitted', () => {
    const parsed = parseRepr({
      id: 'r1',
      title: 'Title',
      categories: [],
      dateCreated: 123,
      datesPracticed: [],
      comment: '',
    })

    expect(parsed.learning).toBe(false)
  })

  it('throws on invalid repr', () => {
    expect(() => parseRepr({ id: 'r1' })).toThrow()
    expect(() => parseRepr(null)).toThrow()
    expect(() => parseRepr('x')).toThrow()
  })

  it('throws when repr fields have wrong types', () => {
    expect(() =>
      parseRepr({
        id: 1,
        title: 't',
        categories: [],
        dateCreated: 0,
        datesPracticed: [],
        comment: '',
      })
    ).toThrow(/Invalid id/)
    expect(() =>
      parseRepr({
        id: 'r1',
        title: 't',
        categories: [1],
        dateCreated: 0,
        datesPracticed: [],
        comment: '',
      })
    ).toThrow(/Invalid categories/)
    expect(() =>
      parseRepr({
        id: 'r1',
        title: 't',
        categories: [],
        dateCreated: 'x',
        datesPracticed: [],
        comment: '',
      })
    ).toThrow(/Invalid dateCreated/)
    expect(() =>
      parseRepr({
        id: 'r1',
        title: 't',
        categories: [],
        dateCreated: 0,
        datesPracticed: ['x'],
        comment: '',
      })
    ).toThrow(/Invalid datesPracticed/)
    expect(() =>
      parseRepr({
        id: 'r1',
        title: 1,
        categories: [],
        dateCreated: 0,
        datesPracticed: [],
        comment: '',
      })
    ).toThrow(/Invalid title/)
    expect(() =>
      parseRepr({
        id: 'r1',
        title: 't',
        categories: [],
        dateCreated: 0,
        datesPracticed: [],
        comment: 1,
      })
    ).toThrow(/Invalid comment/)
  })

  it('throws when parseReprs input is not an array', () => {
    expect(() => parseReprs({})).toThrow(/array/)
  })

  it('throws when dateCreated is NaN', () => {
    expect(() =>
      parseRepr({
        id: 'r1',
        title: 't',
        categories: [],
        dateCreated: Number.NaN,
        datesPracticed: [],
        comment: '',
      })
    ).toThrow(/Invalid dateCreated/)
  })

  it('treats non-boolean learning values as false', () => {
    const parsed = parseRepr({
      id: 'r1',
      title: 'Title',
      categories: [],
      dateCreated: 123,
      datesPracticed: [],
      comment: '',
      learning: 'yes',
    })
    expect(parsed.learning).toBe(false)
  })

  it('throws when parseReprs contains an invalid repr', () => {
    expect(() =>
      parseReprs([
        {
          id: 'r1',
          title: 'Title',
          categories: ['a'],
          dateCreated: 123,
          datesPracticed: [456],
          comment: 'ok',
        },
        { id: 'bad' },
      ])
    ).toThrow()
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
