#!/usr/bin/env node
/**
 * Bundles the Lambda handler entrypoint and the CDK app into apps/server/dist.
 */
import * as esbuild from 'esbuild'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { bundleServerArtifacts } = require('./esbuild.bundle.js')

await bundleServerArtifacts(esbuild, __dirname)
