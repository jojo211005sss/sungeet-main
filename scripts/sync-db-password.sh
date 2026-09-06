#!/usr/bin/env bash
# Copies the password from the website's .env into the attendance app's .env,
# then tests the connection.
#
# Exists because the interactive prompt in rotate-db-password.sh needs a real
# terminal, which the app's Run button does not provide. Edit one line by hand,
# then run this.
set -uo pipefail

SITE_ENV="$HOME/sunggeet main 1/.env"
ATT_ENV="$HOME/sungeet-attendance/.env"

[ -f "$SITE_ENV" ] || { echo "✗ not found: $SITE_ENV"; exit 1; }

PW=$(sed -nE 's|.*postgresql://[^:]+:([^@]*)@.*|\1|p' "$SITE_ENV" | head -1)

if [ -z "$PW" ]; then
  echo "✗ couldn't find a password in $SITE_ENV"
  exit 1
fi
if [ "$PW" = "PASTE_PASSWORD_HERE" ]; then
  echo "✗ $SITE_ENV still has the placeholder. Edit it first."
  exit 1
fi

echo "Found a password of ${#PW} characters in the website .env."

if [ -f "$ATT_ENV" ]; then
  ESCAPED=$(printf '%s' "$PW" | sed -e 's/[&|\\]/\\&/g')
  sed -i '' -E "s|(postgresql://[^:]+:)[^@]*(@)|\1${ESCAPED}\2|g" "$ATT_ENV"
  echo "  ✓ synced $(grep -c 'postgresql://' "$ATT_ENV") connection string(s) into the attendance .env"
else
  echo "  – attendance .env not found, skipped"
fi

echo
echo "Testing…"
cd "$HOME/sunggeet main 1" && npm run --silent db:inspect 2>&1 | tail -5
