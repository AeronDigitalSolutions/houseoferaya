#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "Starting stable dev server on port ${PORT}..."

if command -v lsof >/dev/null 2>&1; then
  # Kill stale local dev servers that may hold .next files and cause ENOENT manifest races.
  PIDS="$(
    for p in $(seq "${PORT}" $((PORT + 20))); do
      lsof -ti "tcp:${p}" 2>/dev/null || true
    done | sort -u
  )"

  if [[ -n "${PIDS}" ]]; then
    echo "Releasing stale local server process(es): ${PIDS}"
    while IFS= read -r pid; do
      [[ -n "${pid}" ]] && kill -9 "${pid}" || true
    done <<< "${PIDS}"
    sleep 1
  fi
fi

# Full clean avoids stale/partial manifests during heavy UI iteration.
rm -rf .next-dev 2>/dev/null || true

exec npx next dev --turbopack --port "${PORT}"
