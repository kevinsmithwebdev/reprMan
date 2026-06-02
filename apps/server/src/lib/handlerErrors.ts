import { UnauthorizedError } from './auth'
import { jsonResponse } from './http'

export type HandlerErrorOptions = {
  serverMessage?: string
  badRequestMessage?: string
  defaultStatus?: number
  defaultMessage?: string
}

/**
 * Maps handler errors to API Gateway JSON responses.
 * Unauthorized → 401; SyntaxError → 400; else defaultStatus (500) with message.
 */
export const mapHandlerError = (
  error: unknown,
  options: HandlerErrorOptions = {}
): { statusCode: number; body: string } => {
  const {
    serverMessage = 'Internal server error',
    badRequestMessage = 'Invalid JSON body',
    defaultStatus,
    defaultMessage,
  } = options

  if (error instanceof UnauthorizedError) {
    return jsonResponse(401, { message: 'Unauthorized' })
  }
  if (error instanceof SyntaxError) {
    return jsonResponse(400, { message: badRequestMessage })
  }
  if (defaultStatus !== undefined) {
    return jsonResponse(defaultStatus, {
      message: defaultMessage ?? serverMessage,
    })
  }
  return jsonResponse(500, { message: serverMessage })
}
