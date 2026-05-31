// Run Prettier after Agent or Tab edits (see .cursor/hooks.json).
const { execFileSync } = require('child_process')
const { existsSync } = require('fs')
const path = require('path')

let input = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => {
  input += chunk
})
process.stdin.on('end', () => {
  try {
    const { file_path: filePath } = JSON.parse(input || '{}')
    if (!filePath) {
      process.exit(0)
    }

    const prettierBin = path.join(
      process.cwd(),
      'node_modules',
      '.bin',
      'prettier'
    )
    if (!existsSync(prettierBin)) {
      process.exit(0)
    }

    try {
      execFileSync(prettierBin, ['--write', filePath], {
        stdio: 'ignore',
        windowsHide: true,
      })
    } catch {
      // Prettier may fail on unsupported files; don't block the hook pipeline.
    }
  } catch {
    // Ignore malformed hook input.
  }

  process.exit(0)
})
