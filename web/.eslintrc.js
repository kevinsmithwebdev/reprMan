module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ['plugin:react/recommended', 'airbnb', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  ignorePatterns: ['*.css'],
  rules: {
    semi: ['error', 'never'],
    'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'arrow-body-style': ['off'],
    'no-use-before-define': ['off'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'no-restricted-exports': ['off'],
    'import/prefer-default-export': 0,
    'no-underscore-dangle': 0,
    'no-shadow': 0,
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': 1,
    'import/order': 1,
    'react/require-default-props': 0,
    'no-console': [1, { allow: ['warn', 'error', 'info'] }],
  },
  settings: {
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  globals: {
    JSX: true,
  },
}
