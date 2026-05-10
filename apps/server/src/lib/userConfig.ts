/**
 * Server-side helpers for the user-config DynamoDB row. The shared cross-app
 * quota model (defaults, resolution semantics, parsing) lives in
 * `@reprman/shared/quota` and is re-exported here so existing imports keep
 * working during the refactor.
 */
export {
  DEFAULT_MAX_REPRS_ALLOWED,
  parseMaxReprsAllowed,
  resolveMaxReprsAllowed,
  type UserConfigItem,
} from '@reprman/shared/quota'

export const USER_CONFIG_SORT_KEY = 'CONFIG'

export const keyForUserConfig = (userId: string) => ({
  pk: `USER#${userId}`,
  sk: USER_CONFIG_SORT_KEY,
})
