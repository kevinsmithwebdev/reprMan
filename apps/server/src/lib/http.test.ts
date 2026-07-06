import { jsonResponse } from './http'

describe('jsonResponse', () => {
  it('returns JSON with status and content-type header', () => {
    expect(jsonResponse(201, { ok: true })).toEqual({
      statusCode: 201,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    })
  })

  it('merges custom headers', () => {
    expect(
      jsonResponse(
        429,
        { message: 'Too many requests' },
        { 'retry-after': '60' }
      )
    ).toEqual({
      statusCode: 429,
      headers: { 'content-type': 'application/json', 'retry-after': '60' },
      body: JSON.stringify({ message: 'Too many requests' }),
    })
  })
})
