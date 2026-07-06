const path = require('path')

const monorepoRoot = path.resolve(__dirname, '..')

const libRoot = (name) => path.join(monorepoRoot, 'libs', name, 'src')
const sharedLibRoot = (name) =>
  path.join(monorepoRoot, 'libs/shared', name, 'src')

/** Canonical @reprman/* path alias roots — keep in sync with tsconfig.base.json. */
const alias = {
  '@reprman/shared/repr-model': sharedLibRoot('repr-model'),
  '@reprman/shared/repr-validation': sharedLibRoot('repr-validation'),
  '@reprman/shared/repr-rules': sharedLibRoot('repr-rules'),
  '@reprman/shared/quota': sharedLibRoot('quota'),
  '@reprman/shared/subscription': sharedLibRoot('subscription'),

  '@reprman/components': libRoot('components'),
  '@reprman/modals': libRoot('modals'),
  '@reprman/state': libRoot('state'),
  '@reprman/cognito-auth': libRoot('cognito-auth'),
  '@reprman/localization': libRoot('localization'),
  '@reprman/reprs-api': libRoot('reprs-api'),
  '@reprman/utilities': libRoot('utilities'),
  '@reprman/constants': libRoot('constants'),
  '@reprman/types': libRoot('types'),
  '@reprman/theme': libRoot('theme'),
  '@reprman/client-config': libRoot('client-config'),
  '@reprman/client-platform': libRoot('client-platform'),
}

module.exports = { alias, monorepoRoot, libRoot, sharedLibRoot }
