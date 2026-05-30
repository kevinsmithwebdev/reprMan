const { dirname, resolve } = require('node:path')

const bundleServerArtifacts = async (esbuildImpl, rootDir = __dirname) => {
  const tsconfig = resolve(rootDir, 'tsconfig.app.json')
  const shared = {
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    sourcemap: true,
    tsconfig,
    logLevel: 'info',
  }

  await esbuildImpl.build({
    ...shared,
    entryPoints: [resolve(rootDir, 'src/handlers/router.ts')],
    outfile: resolve(rootDir, 'dist/handlers/router.js'),
    external: ['@aws-sdk/*'],
  })

  await esbuildImpl.build({
    ...shared,
    entryPoints: [resolve(rootDir, 'src/cdk/app.ts')],
    outfile: resolve(rootDir, 'dist/cdk/app.js'),
    external: ['aws-cdk-lib', 'aws-cdk-lib/*', 'constructs', '@aws-sdk/*'],
  })
}

module.exports = { bundleServerArtifacts }
