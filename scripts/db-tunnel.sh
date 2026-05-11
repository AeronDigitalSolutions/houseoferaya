#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-start}"
SSH_USER="${SSH_USER:-root}"
SSH_HOST="${SSH_HOST:-147.93.28.217}"
LOCAL_PORT="${LOCAL_PORT:-5433}"
REMOTE_HOST="${REMOTE_HOST:-127.0.0.1}"
REMOTE_PORT="${REMOTE_PORT:-5432}"
SOCKET_PATH="${SOCKET_PATH:-/tmp/houseof-eraya-db-tunnel.sock}"

if [[ -n "${SSHPASS:-}" || -n "${SSH_PASSWORD:-}" ]]; then
  if ! command -v sshpass >/dev/null 2>&1; then
    echo "sshpass is required when SSHPASS/SSH_PASSWORD is set"
    exit 1
  fi
  if [[ -z "${SSHPASS:-}" ]]; then
    export SSHPASS="${SSH_PASSWORD}"
  fi
  SSH_CMD=(sshpass -e ssh)
else
  SSH_CMD=(ssh)
fi

SSH_BASE=(
  "${SSH_CMD[@]}"
  -o ExitOnForwardFailure=yes
  -o ServerAliveInterval=30
  -o ServerAliveCountMax=3
  -S "$SOCKET_PATH"
  "${SSH_USER}@${SSH_HOST}"
)

start_tunnel() {
  if "${SSH_BASE[@]}" -O check 2>/dev/null; then
    echo "DB tunnel already running on 127.0.0.1:${LOCAL_PORT}"
    return 0
  fi

  "${SSH_BASE[@]}" -fN -M -L "${LOCAL_PORT}:${REMOTE_HOST}:${REMOTE_PORT}"
  echo "DB tunnel started: 127.0.0.1:${LOCAL_PORT} -> ${REMOTE_HOST}:${REMOTE_PORT} (${SSH_USER}@${SSH_HOST})"
}

stop_tunnel() {
  if "${SSH_BASE[@]}" -O check 2>/dev/null; then
    "${SSH_BASE[@]}" -O exit
    echo "DB tunnel stopped"
  else
    echo "DB tunnel is not running"
  fi
}

status_tunnel() {
  if "${SSH_BASE[@]}" -O check 2>/dev/null; then
    echo "DB tunnel is running on 127.0.0.1:${LOCAL_PORT}"
  else
    echo "DB tunnel is not running"
    return 1
  fi
}

case "$ACTION" in
  start) start_tunnel ;;
  stop) stop_tunnel ;;
  status) status_tunnel ;;
  restart)
    stop_tunnel || true
    start_tunnel
    ;;
  *)
    echo "Usage: $0 {start|stop|status|restart}"
    exit 1
    ;;
esac
