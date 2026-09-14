const path = require('node:path')
const fs = require('node:fs')
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')
// Junction/symlink created by `npm run link:libs` so Metro can SHA-1 sources
// under projectRoot (Windows Metro watchFolders SHA-1 bug workaround).
const libsRoot = path.resolve(projectRoot, 'libs')

const alias = {
  '@reprman/shared/repr-model': path.join(libsRoot, 'shared/repr-model/src'),
  '@reprman/shared/repr-validation': path.join(
    libsRoot,
    'shared/repr-validation/src'
  ),
  '@reprman/shared/repr-rules': path.join(libsRoot, 'shared/repr-rules/src'),
  '@reprman/shared/quota': path.join(libsRoot, 'shared/quota/src'),
  '@reprman/shared/subscription': path.join(
    libsRoot,
    'shared/subscription/src'
  ),
  '@reprman/state': path.join(libsRoot, 'state/src'),
  '@reprman/cognito-auth': path.join(libsRoot, 'cognito-auth/src'),
  '@reprman/localization': path.join(libsRoot, 'localization/src'),
  '@reprman/reprs-api': path.join(libsRoot, 'reprs-api/src'),
  '@reprman/utilities': path.join(libsRoot, 'utilities/src'),
  '@reprman/constants': path.join(libsRoot, 'constants/src'),
  '@reprman/types': path.join(libsRoot, 'types/src'),
  '@reprman/client-config': path.join(libsRoot, 'client-config/src'),
  '@reprman/client-platform': path.join(libsRoot, 'client-platform/src'),
  '@reprman/modals': path.join(libsRoot, 'modals/src'),
}

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
config.resolver.disableHierarchicalLookup = true

const forceMobileModule = (name) =>
  path.resolve(projectRoot, 'node_modules', name)

config.resolver.extraNodeModules = {
  react: forceMobileModule('react'),
  'react-dom': forceMobileModule('react-dom'),
  'react-native': forceMobileModule('react-native'),
  'react-redux': forceMobileModule('react-redux'),
  '@reduxjs/toolkit': forceMobileModule('@reduxjs/toolkit'),
  'redux-saga': forceMobileModule('redux-saga'),
  'aws-amplify': forceMobileModule('aws-amplify'),
  '@aws-amplify/react-native': forceMobileModule('@aws-amplify/react-native'),
  '@react-native-async-storage/async-storage': forceMobileModule(
    '@react-native-async-storage/async-storage'
  ),
  i18next: forceMobileModule('i18next'),
  moment: forceMobileModule('moment'),
  uuid: forceMobileModule('uuid'),
}

// React Compiler injects `react/compiler-runtime`. extraNodeModules alone does
// not always cover that subpath when the origin is a shared lib whose realpath
// sits under the monorepo root (React 18, no compiler-runtime).
const resolveReactFromMobile = (moduleName) => {
  if (moduleName !== 'react' && !moduleName.startsWith('react/')) {
    return null
  }
  try {
    return require.resolve(moduleName, { paths: [projectRoot] })
  } catch {
    return null
  }
}

const resolveExisting = (candidates) => {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }
  return null
}

const resolveAliasTarget = (moduleName, platform) => {
  const exact = alias[moduleName]
  if (exact) {
    return resolveExisting([
      path.join(exact, 'index.ts'),
      path.join(exact, 'index.tsx'),
      `${exact}.ts`,
      `${exact}.tsx`,
      exact,
    ])
  }

  const sortedKeys = Object.keys(alias).sort((a, b) => b.length - a.length)
  for (const key of sortedKeys) {
    if (!moduleName.startsWith(`${key}/`)) {
      continue
    }
    const rest = moduleName.slice(key.length + 1)
    const base = path.join(alias[key], rest)

    if (rest === 'storage' || rest.endsWith('/storage')) {
      const platformCandidates =
        platform === 'web'
          ? [`${base}.web.ts`, `${base}.ts`]
          : [`${base}.native.ts`, `${base}.ts`]
      return resolveExisting(platformCandidates)
    }

    return resolveExisting([
      `${base}.ts`,
      `${base}.tsx`,
      path.join(base, 'index.ts'),
      path.join(base, 'index.tsx'),
      base,
    ])
  }

  return null
}

const defaultResolveRequest = config.resolver.resolveRequest

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@reprman/')) {
    const filePath = resolveAliasTarget(moduleName, platform)
    if (filePath) {
      return {
        type: 'sourceFile',
        filePath: path.resolve(filePath),
      }
    }
  }

  const reactPath = resolveReactFromMobile(moduleName)
  if (reactPath) {
    return {
      type: 'sourceFile',
      filePath: reactPath,
    }
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform)
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
