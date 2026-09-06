#!/usr/bin/env bash
# Stops the dev servers started by scripts/start.sh.
# Kills the recorded PIDs first, then sweeps the ports in case something was
# started by hand outside this script.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1

WEB_PORT="${WEB_PORT:-5173}"
API_PORT="${API_PORT:-5174}"
PIDFILE="$ROOT/.dev-pids"

stopped=0

if [ -f "$PIDFILE" ]; then
  while read -r name pid; do
    [ -z "${pid:-}" ] && continue
    if kill -0 "$pid" 2>/dev/null; then
      # Kill the process group: npm spawns a child, and killing only the
      # parent leaves the actual server holding the port.
      kill -TERM -"$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null
      stopped=$((stopped + 1))
      echo "✓ stopped $name (pid $pid)"
    fi
  done < "$PIDFILE"
  rm -f "$PIDFILE"
fi

sleep 1

for p in "$WEB_PORT" "$API_PORT"; do
  pids=$(lsof -ti tcp:"$p" -sTCP:LISTEN 2>/dev/null)
  if [ -n "$pids" ]; then
    echo "  port $p still held, forcing"
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null
    stopped=$((stopped + 1))
  fi
done

sleep 0.5
for p in "$WEB_PORT" "$API_PORT"; do
  if lsof -ti tcp:"$p" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "✗ port $p is STILL in use"
    exit 1
  fi
  echo "✓ port $p free"
done

[ "$stopped" -eq 0 ] && echo "  (nothing was running)"
exit 0
