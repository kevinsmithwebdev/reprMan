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

export type UserConfigItem = {
  pk: string
  sk: string
  maxReprsAllowed?: number | null
}

/**
 * Resolved quota for API and enforcement.
 * - number: hard cap
 * - null: unlimited (explicit null in DynamoDB)
 */
export function resolveMaxReprsAllowed(
  item: UserConfigItem | null | undefined
): number | null {
  if (!item || !Object.prototype.hasOwnProperty.call(item, 'maxReprsAllowed')) {
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
