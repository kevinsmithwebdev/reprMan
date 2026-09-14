const path = require('path')

/** Expo / React Native app — lint without requiring expo packages in root CI. */
module.exports = {
  extends: [path.join(__dirname, '../../.eslintrc.js')],
  settings: {
    'import/resolver': {
      typescript: {
        // Avoid apps/client-mobile/tsconfig.json (extends expo/tsconfig.base).
        project: [path.resolve(__dirname, 'tsconfig.eslint.json')],
      },
    },
  },
  rules: {
    // Monorepo path aliases (@reprman/*, @/) are not package.json deps.
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    // Expo Router screens use `export default function`.
    'react/function-component-definition': 'off',
  },
}
