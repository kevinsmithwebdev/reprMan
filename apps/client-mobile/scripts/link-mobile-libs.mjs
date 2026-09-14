#!/usr/bin/env node
/**
 * Metro on Windows fails SHA-1 for files only reachable via watchFolders.
 * Link monorepo libs under apps/client-mobile/libs (junction on Windows,
 * symlink elsewhere) so resolved sources sit under the Expo projectRoot.
 *
 * Important: never `rm -rf` a Windows junction — that can delete the real
 * libs tree. Only remove the link itself.
 */
import { existsSync, lstatSync, symlinkSync, unlinkSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const linkPath = join(mobileRoot, 'libs')
const targetPath = resolve(mobileRoot, '../../libs')

/** Absolute binaries so spawn does not search a writable PATH (S4036). */
const WINDOWS_CMD = 'C:\\Windows\\System32\\cmd.exe'
const UNIX_RM = '/bin/rm'

const removeExistingLink = () => {
  if (!existsSync(linkPath)) {
    return
  }
  const stat = lstatSync(linkPath)
  if (stat.isSymbolicLink()) {
    unlinkSync(linkPath)
    return
  }
  // Directory junction (Windows) or leftover directory: remove the link only.
  const result = spawnSync(
    process.platform === 'win32' ? WINDOWS_CMD : UNIX_RM,
    process.platform === 'win32' ? ['/c', 'rmdir', linkPath] : ['-f', linkPath],
    { stdio: 'inherit' }
  )
  if (result.status !== 0) {
    throw new Error(`Failed to remove existing link at ${linkPath}`)
  }
}

removeExistingLink()

if (process.platform === 'win32') {
  const result = spawnSync(
    WINDOWS_CMD,
    ['/c', 'mklink', '/J', linkPath, targetPath],
    { stdio: 'inherit' }
  )
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
} else {
  symlinkSync(targetPath, linkPath, 'dir')
}

console.log(`[link-mobile-libs] ${linkPath} -> ${targetPath}`)
