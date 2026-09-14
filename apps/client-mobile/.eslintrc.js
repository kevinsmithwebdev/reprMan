const path = require('path')

/**
 * Expo / React Native app.
 * Root CI does not install Expo/RN packages. Keep style rules from the shared
 * config; disable import-resolution rules that need those packages.
 *
 * Important: do not replace `import/resolver` here. ESLint deep-merges settings,
 * and clearing `typescript.project` makes the resolver fall back to cwd →
 * ./tsconfig.json → expo/tsconfig.base (missing in root CI). The root config
 * pins an explicit project list that never includes the Expo tsconfig.
 */
module.exports = {
  extends: [path.join(__dirname, '../../.eslintrc.js')],
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
