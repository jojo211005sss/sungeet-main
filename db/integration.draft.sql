-- ###########################################################################
-- DRAFT — NOT WIRED UP. Parked while the landing page is finished.
--
-- This is the planned integration with the sungeet-attendance staff app:
-- one Neon database, attendance owns scheduling, this layer adds the
-- public-facing fields plus an approval gate, and exposes only safe columns
-- through views so employee_pay can never reach the public API.
--
-- The live site currently uses db/schema.sql (standalone tables) and its API
-- queries those, not the views below. Nothing here has been run against a
-- real Postgres yet — it is unverified.
--
-- See docs/INTEGRATION.md for the full plan.
-- ###########################################################################

-- Sung Sungeet — PUBLIC WEBSITE LAYER
--
-- This runs on the SAME Neon database as the sungeet-attendance staff app,
-- and it runs AFTER that app's scripts/init-db.js.
--
-- Division of responsibility:
--   attendance owns:  users, shows, attendance, daily_activity
--   this site owns:   site_*, rsvps, and the two public_* views
--
-- The staff `shows` table is the source of truth for scheduling. This layer
-- adds the public-facing fields managers don't enter (city, event type,
-- poster, team) plus an approval gate, and exposes ONLY safe columns through
-- views.
--
-- WHY VIEWS: shows.employee_pay holds salary data. The public API must never
-- be able to select it, so it never queries `shows` directly — it queries
-- public_shows, which does not expose that column.
--
-- Run:  psql "$DATABASE_URL" -f db/schema.sql
-- ===========================================================================

-- --------------------------------------------------------------- teams ----

create table if not exists site_teams (
  id         bigint generated always as identity primary key,
  slug       text        not null unique,
  name       text        not null,
  tagline    text,
  blurb      text,
  photo_url  text,
  video_url  text,
  sort_order int         not null default 0,
  is_active  boolean     not null default true,
  created_at timestamptz not null default now()
);

-- A team member is usually a staff user, but need not be (guests, session
-- players). user_id links to the attendance app when there is an account.
create table if not exists site_team_members (
  id         bigint generated always as identity primary key,
  team_id    bigint not null references site_teams (id) on delete cascade,
  user_id    integer references users (id) on delete set null,
  name       text   not null,        -- stage name; may differ from users.name
  role       text   not null,        -- "vocals", "tabla", ...
  photo_url  text,
  sort_order int    not null default 0
);

create index if not exists site_team_members_team_id_idx
  on site_team_members (team_id);

-- Public stage identity for a staff user, so the website can credit a
-- performer without exposing their account name or any HR data.
create table if not exists site_user_profile (
  user_id    integer primary key references users (id) on delete cascade,
  stage_name text,
  role_label text,                        -- instrument / voice
  is_public  boolean not null default false
);

-- --------------------------------------------------------- publication ----

-- One row per staff show that someone wants on the public site.
-- No row  =  the show is internal and invisible to the website.
create table if not exists site_publication (
  show_id         text primary key references shows (id) on delete cascade,

  -- Public-facing fields the staff scheduling form does not capture.
  venue_public    text,                   -- null falls back to shows.location
  city            text not null,
  event_type      text not null
                    check (event_type in ('cafe', 'private', 'community')),
  set_name        text,
  note            text,
  ticket_url      text,
  poster_url      text,
  team_id         bigint references site_teams (id) on delete set null,

  -- Per-show toggle: should the public site name who is performing?
  -- Off by default, because a private client's lineup is nobody's business.
  show_performers boolean not null default false,

  -- The approval gate. Only 'approved' reaches the website.
  status          text not null default 'draft'
                    check (status in ('draft', 'pending', 'approved', 'rejected')),
  submitted_by    integer references users (id) on delete set null,
  approved_by     integer references users (id) on delete set null,
  approved_at     timestamptz,
  reject_reason   text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists site_publication_status_idx
  on site_publication (status);

-- ---------------------------------------------------------------- rsvp ----

-- The ONLY table the public website writes to. visitor_id is an anonymous
-- uuid minted in the browser — no accounts, no personal data.
create table if not exists rsvps (
  show_id    text not null references shows (id) on delete cascade,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (show_id, visitor_id)
);

create index if not exists rsvps_show_id_idx on rsvps (show_id);

-- --------------------------------------------------------------- views ----

-- The public site's read surface. Deliberately column-by-column: a
-- `select *` here would leak employee_pay the moment someone adds it.
create or replace view public_shows as
select
  s.id,
  -- shows.date is DATE and shows.time is TEXT ("20:30"); the site needs one
  -- instant. Delhi local time is the source of truth for a Delhi gig.
  ((s.date::text || ' ' || s.time)::timestamp at time zone 'Asia/Kolkata')
    as starts_at,
  coalesce(p.venue_public, s.location) as venue,
  p.city,
  p.event_type,
  p.set_name,
  p.note,
  p.ticket_url,
  p.poster_url,
  p.show_performers,
  t.slug as team_slug,
  t.name as team_name
from shows s
join site_publication p on p.show_id = s.id
left join site_teams t on t.id = p.team_id
where p.status = 'approved';

-- Who is credited on a given public show. Returns nothing when the show's
-- show_performers toggle is off, or when a performer hasn't opted in.
create or replace view public_show_lineup as
select
  s.id as show_id,
  coalesce(pr.stage_name, u.name) as name,
  coalesce(pr.role_label, 'performer') as role,
  u.id as user_id
from shows s
join site_publication p on p.show_id = s.id and p.status = 'approved'
                        and p.show_performers
join unnest(s.employee_ids) as emp(user_id) on true
join users u on u.id = emp.user_id
left join site_user_profile pr on pr.user_id = u.id
where coalesce(pr.is_public, false);
