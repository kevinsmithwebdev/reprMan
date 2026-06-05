import LocalizationModule from '@reprman/localization/Localization.module'

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
  const t = LocalizationModule.getInstance().t.bind(
    LocalizationModule.getInstance()
  )

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
  return t('errors.rateLimit.shortWhile')
}

export const toUserFriendlyApiErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  const t = LocalizationModule.getInstance().t.bind(
    LocalizationModule.getInstance()
  )

  if (
    error instanceof ReprsApiError &&
    error.status === 429 &&
    error.payload?.code === 'RATE_LIMIT_EXCEEDED'
  ) {
    const limit = error.payload.limitKey ?? t('errors.rateLimit.requestLimit')
    const max =
      typeof error.payload.max === 'number' &&
      Number.isFinite(error.payload.max)
        ? error.payload.max
        : undefined
    const window = error.payload.window ?? t('errors.rateLimit.window')
    const retryAfter =
      typeof error.payload.retryAfterSeconds === 'number'
        ? formatSeconds(error.payload.retryAfterSeconds)
        : undefined

    const core =
      typeof max === 'number'
        ? t('errors.rateLimit.exceededWithMax', { limit, max, window })
        : t('errors.rateLimit.exceeded', { limit })
    return retryAfter
      ? `${core} ${t('errors.rateLimit.tryAgainIn', { retryAfter })}`
      : core
  }

  if (error instanceof Error && error.message?.trim()) {
    return error.message
  }
  return fallback
}
