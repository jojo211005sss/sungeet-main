---
description: Stop the Sung Sungeet dev servers and free their ports
allowed-tools: Bash(./scripts/kill.sh), Bash(lsof:*)
---

Stop the local development servers by running:

```bash
./scripts/kill.sh
```

The script terminates the PIDs recorded by `start.sh`, then sweeps ports 5173
and 5174 in case something was started by hand, and finally confirms both
ports are free.

Report back:

- What was stopped, or that nothing was running.
- Confirmation that both ports are actually free — the script checks this, so
  quote its result rather than assuming.

**Only touch this project's servers.** If a port is held by something you did
not start, say so and let the user decide — do not kill unrelated processes.
