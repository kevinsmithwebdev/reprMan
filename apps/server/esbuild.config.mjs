#!/usr/bin/env node
/**
 * Bundles the Lambda handler entrypoint and the CDK app into apps/server/dist.
 * - Resolves `@reprman/shared/*` workspace TS aliases via the server tsconfig
 *   so each output file is fully self-contained.
 * - Marks AWS SDK packages as external (provided by Lambda runtime / installed
 *   for local CDK execution).
 */
import * as esbuild from 'esbuild'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tsconfig = resolve(__dirname, 'tsconfig.app.json')

const shared = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: true,
  tsconfig,
  logLevel: 'info',
}

await esbuild.build({
  ...shared,
  entryPoints: [resolve(__dirname, 'src/handlers/router.ts')],
  outfile: resolve(__dirname, 'dist/handlers/router.js'),
  external: ['@aws-sdk/*'],
})

await esbuild.build({
  ...shared,
  entryPoints: [resolve(__dirname, 'src/cdk/app.ts')],
  outfile: resolve(__dirname, 'dist/cdk/app.js'),
  external: ['aws-cdk-lib', 'aws-cdk-lib/*', 'constructs', '@aws-sdk/*'],
})
