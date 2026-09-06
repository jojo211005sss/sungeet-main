#!/usr/bin/env bash
# Updates the Neon password everywhere it is stored locally.
#
# Prompts without echoing, so the password never lands in your shell history
# or on screen. Rewrites only the password segment of each connection string,
# leaving host, database and query parameters untouched.
set -uo pipefail

SITE_ENV="$HOME/sunggeet main 1/.env"
ATT_ENV="$HOME/sungeet-attendance/.env"

printf 'New Neon password (input hidden): '
read -rs NEWPW
printf '\n\n'

if [ -z "$NEWPW" ]; then
  echo "✗ nothing entered, aborting"
  exit 1
fi

# Escape characters that would break the sed replacement.
ESCAPED=$(printf '%s' "$NEWPW" | sed -e 's/[&|\\]/\\&/g')

updated=0
for f in "$SITE_ENV" "$ATT_ENV"; do
  if [ ! -f "$f" ]; then
    echo "  – skipped (not found): $f"
    continue
  fi
  cp "$f" "$f.bak"
  # postgresql://USER:PASSWORD@host/... — replace only between the first
  # colon after the user and the @.
  sed -i '' -E "s|(postgresql://[^:]+:)[^@]*(@)|\1${ESCAPED}\2|g" "$f"
  n=$(grep -c "postgresql://" "$f")
  echo "  ✓ updated $n connection string(s) in $f"
  updated=$((updated + 1))
done

if [ "$updated" -eq 0 ]; then
  echo "✗ no .env files found"
  exit 1
fi

echo
echo "Testing the website database connection…"
cd "$HOME/sunggeet main 1" && npm run --silent db:inspect 2>&1 | tail -4
