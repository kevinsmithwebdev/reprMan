import path from 'node:path'
import { loadEnvConfig } from '@next/env'
import type { NextConfig } from 'next'

const root = path.resolve(__dirname, '../..')

// Monorepo: Cognito/API vars live in repo-root `.env` (same as Vite `envDir: root`).
loadEnvConfig(root)

const trimEnv = (value: string | undefined): string => (value ?? '').trim()

const publicEnv = (nextKey: string, legacyKey: string): string =>
  trimEnv(process.env[nextKey]) || trimEnv(process.env[legacyKey])

const reprmanPackages = [
  '@reprman/components',
  '@reprman/modals',
  '@reprman/state',
  '@reprman/cognito-auth',
  '@reprman/localization',
  '@reprman/reprs-api',
  '@reprman/client-config',
  '@reprman/client-platform',
  '@reprman/utilities',
  '@reprman/constants',
  '@reprman/types',
  '@reprman/shared/repr-model',
  '@reprman/shared/repr-validation',
  '@reprman/shared/repr-rules',
  '@reprman/shared/quota',
  '@reprman/shared/subscription',
]

const nextConfig: NextConfig = {
  transpilePackages: [
    ...reprmanPackages,
    'react-bootstrap',
    '@restart/ui',
    '@restart/hooks',
  ],
  outputFileTracingRoot: root,
  experimental: {
    externalDir: true,
  },
  sassOptions: {
    includePaths: [root],
  },
  env: {
    NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION,
    NEXT_PUBLIC_BUILD_NUMBER: process.env.NEXT_PUBLIC_BUILD_NUMBER,
    NEXT_PUBLIC_BUILD_TIME_UTC: process.env.NEXT_PUBLIC_BUILD_TIME_UTC,
    NEXT_PUBLIC_GIT_SHA: process.env.NEXT_PUBLIC_GIT_SHA,
    // Inline resolved values so the client bundle sees legacy VITE_* names from .env.local.
    NEXT_PUBLIC_COGNITO_USER_POOL_ID: publicEnv(
      'NEXT_PUBLIC_COGNITO_USER_POOL_ID',
      'VITE_COGNITO_USER_POOL_ID'
    ),
    NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID: publicEnv(
      'NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID',
      'VITE_COGNITO_USER_POOL_CLIENT_ID'
    ),
    NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID: publicEnv(
      'NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID',
      'VITE_COGNITO_IDENTITY_POOL_ID'
    ),
    NEXT_PUBLIC_REPRS_API_BASE_URL: publicEnv(
      'NEXT_PUBLIC_REPRS_API_BASE_URL',
      'VITE_REPRS_API_BASE_URL'
    ),
    NEXT_PUBLIC_REQUIRE_HOME_SIGN_IN: publicEnv(
      'NEXT_PUBLIC_REQUIRE_HOME_SIGN_IN',
      'VITE_REQUIRE_HOME_SIGN_IN'
    ),
    NEXT_PUBLIC_ALLOW_ANONYMOUS_HOME: publicEnv(
      'NEXT_PUBLIC_ALLOW_ANONYMOUS_HOME',
      'VITE_ALLOW_ANONYMOUS_HOME'
    ),
  },
}

export default nextConfig
