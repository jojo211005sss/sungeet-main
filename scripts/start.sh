#!/usr/bin/env bash
# Starts the Sung Sungeet dev servers in the background.
#   frontend  Vite            http://localhost:5173
#   backend   api/ handlers   http://localhost:5174
# PIDs are written to .dev-pids so killsungeet can stop exactly these
# processes rather than pattern-matching every node on the machine.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1

WEB_PORT="${WEB_PORT:-5173}"
API_PORT="${API_PORT:-5174}"
PIDFILE="$ROOT/.dev-pids"
LOGDIR="$ROOT/.dev-logs"
mkdir -p "$LOGDIR"

port_busy() { lsof -ti tcp:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

for p in "$WEB_PORT" "$API_PORT"; do
  if port_busy "$p"; then
    echo "✗ port $p is already in use. Run ./scripts/kill.sh first, or:"
    echo "    lsof -i tcp:$p"
    exit 1
  fi
done

: > "$PIDFILE"

API_PORT="$API_PORT" npm run dev:api > "$LOGDIR/api.log" 2>&1 &
echo "api $!" >> "$PIDFILE"

API_PORT="$API_PORT" npm run dev -- --port "$WEB_PORT" --strictPort > "$LOGDIR/web.log" 2>&1 &
echo "web $!" >> "$PIDFILE"

# Health means "the server answered", not "the server said 200". With no
# DATABASE_URL the API correctly returns 503 no_database, and curl -f would
# read that as the server being down.
wait_for() {
  local url="$1" name="$2" code
  for _ in $(seq 1 40); do
    code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 2 "$url" 2>/dev/null)
    if [ -n "$code" ] && [ "$code" != "000" ]; then
      echo "✓ $name  $url  (HTTP $code)"
      return 0
    fi
    sleep 0.5
  done
  echo "✗ $name did not come up — see $LOGDIR"
  return 1
}

ok=0
wait_for "http://localhost:$WEB_PORT/" "frontend" || ok=1
# 405 is a healthy answer from a POST-only route, so probe a GET endpoint.
wait_for "http://localhost:$API_PORT/api/shows" "backend " || ok=1

if [ -f .env ] && grep -q '^DATABASE_URL=.\+' .env; then
  echo "  database: DATABASE_URL set"
else
  echo "  database: not configured — the site will show seed data"
fi

exit $ok
