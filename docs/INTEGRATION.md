# Integration with sungeet-attendance — parked plan

Status: **designed, not built.** Picked up after the landing page is finished.

## What the attendance repo actually is

`jojo211005sss/sungeet-attendance` — React + Vite + Tailwind v3 front end,
Express 5 API in one file (`api/index.js`, ~765 lines), Neon Postgres, JWT
auth with bcrypt, roles `employee | manager | admin | superior`, deployed on
Vercel via a rewrite of `/api/(.*)` to `api/index.js`.

Its tables (`scripts/init-db.js`):

| Table | Shape |
|---|---|
| `users` | id, name, username, password (bcrypt), role |
| `shows` | **id TEXT** (`SGT-1903-A`), date DATE, time TEXT, location TEXT, manager_id, **employee_ids INTEGER[]**, employee_pay JSONB |
| `attendance` | show_id, user_id, status, approval_status, reviewed_by |
| `daily_activity` | user_id, date, status |

## The two problems this has to solve

**1. Table collision.** Both projects define `shows`, with different shapes —
`id TEXT` vs `id bigint`, `date`+`time TEXT` vs `starts_at timestamptz`,
`location` vs `venue`+`city`. On a shared database, this repo's
`CREATE TABLE IF NOT EXISTS shows` silently does nothing and every query
breaks.

**2. Salary data.** `shows.employee_pay` is on the row the website would read.
The public API must never be able to `SELECT *` from that table.

## The plan

One Neon database. Attendance stays the source of truth for scheduling; the
website layer sits beside it and never touches staff tables except by reading.

- `site_teams`, `site_team_members` — the public team concept (attendance has
  users, not teams). Members optionally link to `users.id`.
- `site_user_profile` — a performer's public stage name and instrument, with
  an `is_public` opt-in, so crediting someone never exposes their account.
- `site_publication` — one row per staff show that should be public. Holds the
  fields the staff form doesn't capture (city, event type, poster, team) plus
  the approval gate: `status draft → pending → approved`.
- `rsvps` — the only table the website writes.
- `public_shows` and `public_show_lineup` — **views** listing safe columns
  explicitly. The API queries these, never `shows`.

Draft SQL: [`db/integration.draft.sql`](../db/integration.draft.sql). Unverified —
it has not been run against a real Postgres.

## The "Website Calendar" tab

A new section in the attendance app, per your description:

1. Managers schedule shows exactly as they do now — date, time, location,
   manager, performers. Nothing changes for them.
2. The Website Calendar tab lists upcoming shows and shows which are not yet
   public. Someone fills in the public fields and submits (`pending`).
3. A dedicated approver account reviews and approves. Only `approved` rows
   appear on the website.
4. `show_performers` is a per-show toggle — off by default, so a private
   client's lineup is never published by accident.

This needs a new role (`publisher`) in the `users.role` CHECK constraint, or
reuse of `superior`.

## Refresh

`/api/shows` and `/api/teams` on the website are edge-cached for 24 hours, so
an approval goes live on the next daily rotation. To publish sooner, purge the
Vercel cache for those paths. RSVP counts are a separate uncached endpoint so
they never go stale.

## Open questions

- Weekly-for-next-week as well as the daily rotation, or is daily enough?
- Should the website show attendance ("who actually played") after the fact, or
  only the planned lineup?
- Does `city` get added to the staff scheduling form, or stay website-only?
