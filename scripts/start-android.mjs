#!/usr/bin/env node
/**
 * Starts the mobile app on Android without interactive Expo Go upgrade prompts.
 * Nx/yarn often run Expo in non-TTY shells (e.g. Git Bash on Windows), which
 * causes `expo start --android` to fail when Expo Go needs a patch update.
 */
import { spawn, spawnSync } from 'node:child_process'
import { createWriteStream, readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const isWindows = process.platform === 'win32'
const EXPO_GO_PACKAGE = 'host.exp.exponent'
const VERSIONS_URL = 'https://exp.host/--/api/v2/versions'
const BOOT_TIMEOUT_MS = 120_000

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function run(command, args) {
  return spawnSync(command, args, { encoding: 'utf8' })
}

function adb(args) {
  return run('adb', args)
}

function listDevices() {
  const result = adb(['devices'])
  if (result.status !== 0) {
    return []
  }

  return result.stdout
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('*'))
    .map((line) => {
      const [id, state] = line.split(/\s+/)
      return state === 'device' ? id : null
    })
    .filter(Boolean)
}

function listAvds() {
  const result = run('emulator', ['-list-avds'])
  if (result.status !== 0) {
    return []
  }

  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

async function waitForBoot(deviceId) {
  const started = Date.now()

  while (Date.now() - started < BOOT_TIMEOUT_MS) {
    const result = adb([
      '-s',
      deviceId,
      'shell',
      'getprop',
      'sys.boot_completed',
    ])
    if (result.stdout?.trim() === '1') {
      await sleep(3000)
      return true
    }
    await sleep(2000)
  }

  return false
}

async function ensureDevice() {
  const connected = listDevices()
  if (connected.length > 0) {
    return connected[0]
  }

  const avds = listAvds()
  if (avds.length === 0) {
    return null
  }

  const avd =
    process.env.ANDROID_AVD ??
    avds.find((name) => name.includes('Pixel')) ??
    avds[0]

  console.log(`Starting Android emulator: ${avd}`)
  spawn('emulator', ['-avd', avd], {
    detached: true,
    stdio: 'ignore',
  }).unref()

  const waitResult = adb(['wait-for-device'])
  if (waitResult.status !== 0) {
    return null
  }

  const [deviceId] = listDevices()
  if (!deviceId) {
    return null
  }

  await waitForBoot(deviceId)
  return deviceId
}

function getSdkVersion(projectRoot) {
  const searchRoots = [projectRoot, join(projectRoot, '../..')]
  let expoPkgPath

  for (const root of searchRoots) {
    try {
      expoPkgPath = require.resolve('expo/package.json', { paths: [root] })
      break
    } catch {
      // Try the monorepo root when dependencies are hoisted.
    }
  }

  if (!expoPkgPath) {
    throw new Error('Could not resolve expo package')
  }

  const { version } = JSON.parse(readFileSync(expoPkgPath, 'utf8'))
  return `${String(version).split('.')[0]}.0.0`
}

async function fetchVersions() {
  const response = await fetch(VERSIONS_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch Expo versions (${response.status})`)
  }
  return response.json()
}

function getInstalledExpoGoVersion(deviceId) {
  const result = adb([
    '-s',
    deviceId,
    'shell',
    'dumpsys',
    'package',
    EXPO_GO_PACKAGE,
  ])
  if (result.status !== 0) {
    return null
  }

  const match = result.stdout.match(/versionName=([0-9.]+)/)
  return match?.[1] ?? null
}

function isExpoGoInstalled(deviceId) {
  const result = adb(['-s', deviceId, 'shell', 'pm', 'path', EXPO_GO_PACKAGE])
  return result.status === 0 && result.stdout.includes('package:')
}

async function downloadApk(url, outputPath) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download Expo Go (${response.status})`)
  }

  await mkdir(join(outputPath, '..'), { recursive: true })
  await pipeline(response.body, createWriteStream(outputPath))
}

async function installExpoGo(deviceId, apkPath) {
  if (isExpoGoInstalled(deviceId)) {
    adb(['-s', deviceId, 'uninstall', EXPO_GO_PACKAGE])
  }

  const result = adb(['-s', deviceId, 'install', '-r', apkPath])
  if (result.status !== 0) {
    throw new Error(
      result.stderr?.trim() || result.stdout?.trim() || 'adb install failed'
    )
  }
}

async function ensureExpoGo(deviceId, projectRoot) {
  const sdkVersion = getSdkVersion(projectRoot)
  const versions = await fetchVersions()
  const sdkEntry = versions.sdkVersions?.[sdkVersion]
  const expectedVersion =
    sdkEntry?.androidClientVersion ?? versions.androidVersion
  const apkUrl = sdkEntry?.androidClientUrl ?? versions.androidUrl

  if (!expectedVersion || !apkUrl) {
    throw new Error(`Could not resolve Expo Go for SDK ${sdkVersion}`)
  }

  const installedVersion = getInstalledExpoGoVersion(deviceId)
  if (installedVersion === expectedVersion) {
    console.log(`Expo Go ${expectedVersion} is already installed.`)
    return
  }

  const cacheDir = join(homedir(), '.expo', 'android-apk-cache')
  const apkPath = join(cacheDir, basename(new URL(apkUrl).pathname))

  console.log(
    `Updating Expo Go on ${deviceId} (${
      installedVersion ?? 'not installed'
    } -> ${expectedVersion})...`
  )
  await downloadApk(apkUrl, apkPath)
  await installExpoGo(deviceId, apkPath)
  console.log(`Installed Expo Go ${expectedVersion}.`)
}

function spawnExpoStart(projectRoot) {
  const env = {
    ...process.env,
    CI: '0',
  }
  const args = ['expo', 'start', '--android']

  if (isWindows) {
    return spawn('cmd.exe', ['/d', '/s', '/c', 'npx', ...args], {
      cwd: projectRoot,
      stdio: 'inherit',
      env,
    })
  }

  return spawn('npx', args, {
    cwd: projectRoot,
    stdio: 'inherit',
    env,
  })
}

async function main() {
  const projectRoot = process.cwd()

  try {
    const deviceId = await ensureDevice()
    if (!deviceId) {
      throw new Error('No Android device or emulator available')
    }

    await ensureExpoGo(deviceId, projectRoot)
  } catch (error) {
    console.error(`Failed to prepare Android device: ${error.message}`)
    process.exit(1)
  }

  const child = spawnExpoStart(projectRoot)

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }
    process.exit(code ?? 1)
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
