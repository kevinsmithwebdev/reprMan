const path = require('path')

/**
 * Expo / React Native app.
 * Root CI does not install Expo/RN, and deep-merging the shared config would
 * keep eslint-import-resolver-typescript (which loads ./tsconfig.json →
 * expo/tsconfig.base). Keep style rules; disable import resolution here.
 */
module.exports = {
  extends: [path.join(__dirname, '../../.eslintrc.js')],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    },
  },
  rules: {
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'import/namespace': 'off',
    'import/default': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-cycle': 'off',
    'import/no-duplicates': 'off',
    'import/no-self-import': 'off',
    'import/no-relative-packages': 'off',
    'import/order': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    'react/function-component-definition': 'off',
  },
}
