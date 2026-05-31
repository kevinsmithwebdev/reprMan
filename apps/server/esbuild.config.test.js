const { spawnSync } = require('node:child_process')
const { bundleServerArtifacts } = require('./esbuild.bundle.js')

describe('esbuild.bundle.js', () => {
  it('bundles handler and cdk entrypoints', async () => {
    const build = jest.fn().mockResolvedValue({})
    await bundleServerArtifacts({ build })

    expect(build).toHaveBeenCalledTimes(2)
    expect(build.mock.calls[0][0].entryPoints[0]).toMatch(/handlers[/\\]router\.ts$/)
    expect(build.mock.calls[1][0].entryPoints[0]).toMatch(/cdk[/\\]app\.ts$/)
  })

  it('executes esbuild.config.mjs entrypoint', () => {
    const result = spawnSync(process.execPath, ['esbuild.config.mjs'], {
      cwd: __dirname,
      stdio: 'pipe',
    })

    expect(result.status).toBe(0)
  }, 120000)
})
