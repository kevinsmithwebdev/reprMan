export type ApiErrorPayload = {
  code?: string
  message?: string
  limitKey?: string
  max?: number
  window?: string
  retryAfterSeconds?: number
}

export class ReprsApiError extends Error {
  status: number

  payload?: ApiErrorPayload

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message)
    this.name = 'ReprsApiError'
    this.status = status
    this.payload = payload
  }
}

const formatSeconds = (seconds: number): string => {
  if (Number.isFinite(seconds) && seconds > 0) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`
    }
    if (hours > 0) {
      return `${hours}h`
    }
    if (minutes > 0) {
      return `${minutes}m`
    }
    return `${seconds}s`
  }
  return 'a short while'
}

export const toUserFriendlyApiErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (
    error instanceof ReprsApiError &&
    error.status === 429 &&
    error.payload?.code === 'RATE_LIMIT_EXCEEDED'
  ) {
    const limit = error.payload.limitKey ?? 'request limit'
    const max =
      typeof error.payload.max === 'number' &&
      Number.isFinite(error.payload.max)
        ? error.payload.max
        : undefined
    const window = error.payload.window ?? 'window'
    const retryAfter =
      typeof error.payload.retryAfterSeconds === 'number'
        ? formatSeconds(error.payload.retryAfterSeconds)
        : undefined

    const core =
      typeof max === 'number'
        ? `Rate limit exceeded (${limit}: ${max} per ${window}).`
        : `Rate limit exceeded (${limit}).`
    return retryAfter ? `${core} Try again in ${retryAfter}.` : core
  }

  if (error instanceof Error && error.message?.trim()) {
    return error.message
  }
  return fallback
}
