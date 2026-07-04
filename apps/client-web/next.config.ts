import path from 'node:path'
import { loadEnvConfig } from '@next/env'
import type { NextConfig } from 'next'

const root = path.resolve(__dirname, '../..')

// Monorepo: Cognito/API vars live in repo-root `.env` (same as Vite `envDir: root`).
loadEnvConfig(root)

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
  transpilePackages: reprmanPackages,
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
  },
}

export default nextConfig
