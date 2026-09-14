const config = {
  default: {},
  // OpenNext always re-runs a Next.js build. Default is `yarn build` in this
  // package; keep it explicit so the Nx `build:open-next` target does not
  // depend on a missing package.json script.
  buildCommand:
    'node ../../scripts/with-build-metadata.mjs NEXT_PUBLIC "npx next build"',
}

export default config
