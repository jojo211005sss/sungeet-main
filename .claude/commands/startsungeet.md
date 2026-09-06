---
description: Start the Sung Sungeet dev servers (frontend + API) in the background
allowed-tools: Bash(./scripts/start.sh), Bash(cat .dev-logs/*), Bash(curl:*), Bash(lsof:*)
---

Start the local development servers by running:

```bash
./scripts/start.sh
```

The script starts both servers in the background, waits for each to answer,
and prints their URLs:

- **frontend** — Vite, http://localhost:5173
- **backend** — the `api/` handlers, http://localhost:5174 (Vite proxies `/api` to it)

Then report back to the user:

- The two URLs, with the frontend one first since that's what they'll open.
- Whether `DATABASE_URL` is set. If it isn't, say plainly that the calendar,
  teams and RSVPs will show **seed data, not real data** — that's the single
  most common source of confusion here.

If a port is already in use the script exits without starting anything and
says so. In that case tell the user to run `/killsungeet` first — do not try
to kill processes yourself unless they ask.

If a server fails to come up, read `.dev-logs/web.log` or `.dev-logs/api.log`
and report the actual error rather than guessing.
