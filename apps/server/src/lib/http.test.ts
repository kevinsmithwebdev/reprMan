import { jsonResponse } from './http'

describe('jsonResponse', () => {
  it('returns JSON with status and content-type header', () => {
    expect(jsonResponse(201, { ok: true })).toEqual({
      statusCode: 201,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    })
  })
})
