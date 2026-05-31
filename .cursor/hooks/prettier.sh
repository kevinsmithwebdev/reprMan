#!/usr/bin/env bash
# Run Prettier after Agent or Tab edits (see .cursor/hooks.json).
set -euo pipefail

input=$(cat)
file_path=$(INPUT="$input" node -e 'const j = JSON.parse(process.env.INPUT); process.stdout.write(j.file_path || "")')

if [[ -z "$file_path" ]]; then
  exit 0
fi

prettier_bin="./node_modules/.bin/prettier"
if [[ ! -f "$prettier_bin" ]]; then
  exit 0
fi

"$prettier_bin" --write "$file_path" >/dev/null 2>&1 || true
exit 0
