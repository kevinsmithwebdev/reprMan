const path = require('path')

const tsImportResolver = {
  typescript: {
    // Root tsconfig is references-only; lint against both the client-web
    // tsconfig (for `baseUrl: src` resolution) and the workspace base
    // (for `@reprman/*` shared lib paths).
    project: [
      path.resolve(__dirname, 'apps/client-web/tsconfig.json'),
      path.resolve(__dirname, 'tsconfig.base.json'),
    ],
  },
  node: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
}

const mobileImportOffRules = {
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
}

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
  // Node-only by default. TypeScript resolver is opt-in via overrides so
  // client-mobile does not inherit it (expo/tsconfig.base is not in root CI).
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    },
  },
  globals: {
    JSX: true,
  },
  overrides: [
    {
      files: [
        'apps/client-web/**/*.{js,jsx,ts,tsx}',
        'libs/**/*.{js,jsx,ts,tsx}',
        // Lib targets lint with cwd=libs/<name>, so paths look like src/...
        'src/**/*.{js,jsx,ts,tsx}',
      ],
      excludedFiles: ['apps/client-mobile/**', '**/*.native.{ts,tsx}'],
      settings: {
        'import/resolver': tsImportResolver,
      },
    },
    {
      files: [
        'apps/client-web/app/**/*.{js,jsx,ts,tsx}',
        'apps/client-web/src/**/*.{js,jsx,ts,tsx}',
        'apps/client-mobile/src/**/*.{js,jsx,ts,tsx}',
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
    {
      // Native-only platform modules; RN deps live in apps/client-mobile, not root.
      files: ['**/*.native.{ts,tsx}'],
      rules: {
        'import/no-unresolved': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      // Mobile: Expo/RN packages are not installed at the monorepo root in CI.
      files: ['apps/client-mobile/**/*.{js,jsx,ts,tsx}'],
      rules: mobileImportOffRules,
    },
  ],
}
