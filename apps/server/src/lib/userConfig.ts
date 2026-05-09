const rawDefault = process.env.DEFAULT_MAX_REPRS_ALLOWED ?? '25'
const parsed = Number(rawDefault)
export const DEFAULT_MAX_REPRS_ALLOWED =
  Number.isFinite(parsed) && parsed >= 0 ? parsed : 25

export const USER_CONFIG_SORT_KEY = 'CONFIG'

export const keyForUserConfig = (userId: string) => ({
  pk: `USER#${userId}`,
  sk: USER_CONFIG_SORT_KEY,
})

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
