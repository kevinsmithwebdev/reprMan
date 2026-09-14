const path = require('path')

/** Expo / React Native app — relaxes rules that conflict with expo-router defaults. */
module.exports = {
  extends: [path.join(__dirname, '../../.eslintrc.js')],
  settings: {
    'import/resolver': {
      typescript: {
        project: [
          path.resolve(__dirname, 'tsconfig.json'),
          path.resolve(__dirname, '../../tsconfig.base.json'),
        ],
      },
    },
  },
  rules: {
    // Monorepo path aliases (@reprman/*, @/) are not package.json deps.
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    // Expo Router screens use `export default function`.
    'react/function-component-definition': 'off',
  },
}
