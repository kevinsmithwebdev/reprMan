/**
 * Default per-user repr cap when neither the env var nor a user-specific
 * config row is present. Server controls the env var; client mirrors the
 * fallback in case the user-config endpoint is unreachable.
 */
const rawDefault =
  (typeof process !== 'undefined' && process.env?.DEFAULT_MAX_REPRS_ALLOWED) ||
  '25'
const parsedDefault = Number(rawDefault)

export const DEFAULT_MAX_REPRS_ALLOWED =
  Number.isFinite(parsedDefault) && parsedDefault >= 0 ? parsedDefault : 25

/** Current Terms of Use document version (kept in sync with @reprman/constants). */
export const TERMS_VERSION = '1'

/** Default days before a repr is considered overdue (client settings). */
export const DEFAULT_PRACTICE_DELAY = 30

export const PRACTICE_DELAY_MIN = 0
export const PRACTICE_DELAY_MAX = 365

/** Portion of practice delay after which a repr shows a warning color. */
export const DEFAULT_WARNING_RATIO = 0.5

export type UserConfigItem = {
  pk: string
  sk: string
  maxReprsAllowed?: number | null
  termsAcceptedAt?: string
  termsVersion?: string
  practiceDelay?: number
  warningRatio?: number
}

export type PracticeSettings = {
  practiceDelay: number
  warningRatio: number
}

/**
 * Resolved quota for API and enforcement.
 * - number: hard cap
 * - null: unlimited (explicit null in DynamoDB)
 */
export function resolveMaxReprsAllowed(
  item: UserConfigItem | null | undefined
): number | null {
  if (!item || !Object.hasOwn(item, 'maxReprsAllowed')) {
    return DEFAULT_MAX_REPRS_ALLOWED
  }
  if (item.maxReprsAllowed === null) {
    return null
  }
  return item.maxReprsAllowed as number
}

/**
 * Normalizes the raw `maxReprsAllowed` field as returned by the user-config
 * API. Used by the client to interpret the response shape.
 *
 * - explicit `null` -> unlimited
 * - finite number -> that cap
 * - anything else (`undefined`, missing, non-number) -> `undefined`
 */
export const parseMaxReprsAllowed = (
  raw: unknown
): number | null | undefined => {
  if (raw === null) {
    return null
  }
  if (typeof raw === 'number') {
    return raw
  }
  return undefined
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export const resolvePracticeDelay = (
  item: UserConfigItem | null | undefined
): number => {
  const raw = item?.practiceDelay
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    return DEFAULT_PRACTICE_DELAY
  }
  return clamp(Math.round(raw), PRACTICE_DELAY_MIN, PRACTICE_DELAY_MAX)
}

export const resolveWarningRatio = (
  item: UserConfigItem | null | undefined
): number => {
  const raw = item?.warningRatio
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    return DEFAULT_WARNING_RATIO
  }
  return clamp(Math.round(raw * 10) / 10, 0, 1)
}

export const resolvePracticeSettings = (
  item: UserConfigItem | null | undefined
): PracticeSettings => ({
  practiceDelay: resolvePracticeDelay(item),
  warningRatio: resolveWarningRatio(item),
})

export type PracticeSettingsValidation =
  | { ok: true; value: PracticeSettings }
  | { ok: false; message: string }

export const validatePracticeSettingsPayload = (
  raw: unknown
): PracticeSettingsValidation => {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, message: 'Request body must be a JSON object' }
  }
  const body = raw as Record<string, unknown>
  const { practiceDelay, warningRatio } = body
  if (typeof practiceDelay !== 'number' || !Number.isFinite(practiceDelay)) {
    return { ok: false, message: 'practiceDelay must be a finite number' }
  }
  if (typeof warningRatio !== 'number' || !Number.isFinite(warningRatio)) {
    return { ok: false, message: 'warningRatio must be a finite number' }
  }
  const roundedDelay = Math.round(practiceDelay)
  if (roundedDelay < PRACTICE_DELAY_MIN || roundedDelay > PRACTICE_DELAY_MAX) {
    return {
      ok: false,
      message: `practiceDelay must be between ${PRACTICE_DELAY_MIN} and ${PRACTICE_DELAY_MAX}`,
    }
  }
  const roundedRatio = Math.round(warningRatio * 10) / 10
  if (roundedRatio < 0 || roundedRatio > 1) {
    return { ok: false, message: 'warningRatio must be between 0 and 1' }
  }
  return {
    ok: true,
    value: {
      practiceDelay: roundedDelay,
      warningRatio: roundedRatio,
    },
  }
}
