import { UnauthorizedError } from './auth'
import { mapHandlerError } from './handlerErrors'

describe('mapHandlerError', () => {
  it('maps UnauthorizedError to 401', () => {
    const res = mapHandlerError(new UnauthorizedError())
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body)).toEqual({ message: 'Unauthorized' })
  })

  it('maps SyntaxError to 400', () => {
    const res = mapHandlerError(new SyntaxError('bad json'))
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body)).toEqual({ message: 'Invalid JSON body' })
  })

  it('uses custom badRequestMessage for SyntaxError', () => {
    const res = mapHandlerError(new SyntaxError('bad json'), {
      badRequestMessage: 'Malformed body',
    })
    expect(JSON.parse(res.body)).toEqual({ message: 'Malformed body' })
  })

  it('uses defaultStatus when provided', () => {
    const res = mapHandlerError(new Error('nope'), {
      defaultStatus: 400,
      defaultMessage: 'Bad request',
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body)).toEqual({ message: 'Bad request' })
  })

  it('uses serverMessage when defaultStatus is set without defaultMessage', () => {
    const res = mapHandlerError(new Error('nope'), {
      defaultStatus: 503,
      serverMessage: 'Service unavailable',
    })
    expect(res.statusCode).toBe(503)
    expect(JSON.parse(res.body)).toEqual({ message: 'Service unavailable' })
  })

  it('falls back to 500 with serverMessage', () => {
    const res = mapHandlerError(new Error('boom'), {
      serverMessage: 'Internal server error',
    })
    expect(res.statusCode).toBe(500)
    expect(JSON.parse(res.body)).toEqual({ message: 'Internal server error' })
  })
})
