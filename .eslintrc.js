const path = require('path')

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
  ignorePatterns: ['*.css', '*.json'],
  rules: {
    semi: ['error', 'never'],
    'react/jsx-filename-extension': [
      'warn',
      {
        extensions: ['.tsx', '.test.tsx', '.integration.test.tsx', 'test.js'],
      },
    ],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/react-in-jsx-scope': 'off',
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
    '@typescript-eslint/no-unused-vars': [
      1,
      {
        argsIgnorePattern: '^_',
      },
    ],
    'import/order': 1,
    'react/require-default-props': 0,
    'no-console': [1, { allow: ['warn', 'error', 'info'] }],
  },
  settings: {
    'import/resolver': {
      typescript: {
        // Root tsconfig is references-only; lint against both the client-web
        // tsconfig (for `baseUrl: src` resolution) and the workspace base
        // (for `@reprman/*` shared lib paths).
        project: [
          path.resolve(__dirname, 'apps/client-web/tsconfig.json'),
          path.resolve(__dirname, 'tsconfig.base.json'),
        ],
      },
    },
  },
  globals: {
    JSX: true,
  },
  overrides: [
    {
      files: [
        'apps/client-web/app/**/*.{js,jsx,ts,tsx}',
        'apps/client-web/src/**/*.{js,jsx,ts,tsx}',
        'src/**/*.{js,jsx,ts,tsx}',
      ],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: [
        '**/integration-tests/**/*.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/*.helpers.test.{ts,tsx}',
      ],
      rules: {
        'import/no-relative-packages': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
}
