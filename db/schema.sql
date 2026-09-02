-- Sung Sungeet — public site schema
--
-- IMPORTANT: these tables are the contract between this public site and the
-- staff/manager backend that will be built separately. The public site only
-- ever READS shows, teams, team_members and show_lineup. The staff tool owns
-- the writes. The only table this site writes to is `rsvps`.
--
-- Run once:  psql "$DATABASE_URL" -f db/schema.sql

-- A team is a named lineup that plays shows: "the Tuesday trio", "the full
-- band". Members below are its default roster.
create table if not exists teams (
  id          bigint generated always as identity primary key,
  slug        text        not null unique,
  name        text        not null,
  tagline     text,                       -- one line, shown under the name
  blurb       text,                       -- short paragraph on the team card
  photo_url   text,                       -- null renders the placeholder tile
  video_url   text,                       -- showreel; null hides the play button
  sort_order  int         not null default 0,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists team_members (
  id         bigint generated always as identity primary key,
  team_id    bigint not null references teams (id) on delete cascade,
  name       text   not null,
  role       text   not null,             -- "vocals", "guitar", "tabla", ...
  photo_url  text,
  sort_order int    not null default 0
);

create index if not exists team_members_team_id_idx on team_members (team_id);

create table if not exists shows (
  id           bigint generated always as identity primary key,
  starts_at    timestamptz not null,
  venue        text        not null,
  city         text        not null,
  -- 'cafe' | 'private' | 'community'
  event_type   text        not null check (event_type in ('cafe', 'private', 'community')),
  team_id      bigint      references teams (id) on delete set null,
  set_name     text,
  note         text,
  ticket_url   text,
  -- Event poster artwork, portrait (roughly 3:4). Drives the event card.
  -- Null falls back to a typographic card — see src/components/Calendar.tsx.
  poster_url   text,
  is_published boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists shows_starts_at_idx on shows (starts_at);
create index if not exists shows_team_id_idx on shows (team_id);

-- Per-date lineup override. If a show has NO rows here, the site falls back to
-- the team's default roster in team_members. If it has rows, they replace it —
-- that is how "Priya couldn't make the 19th" gets represented.
create table if not exists show_lineup (
  show_id   bigint not null references shows (id) on delete cascade,
  member_id bigint not null references team_members (id) on delete cascade,
  primary key (show_id, member_id)
);

-- One row per visitor per show. visitor_id is an anonymous uuid minted in the
-- browser and kept in localStorage — no accounts, no personal data.
-- This is the ONLY table the public site writes to.
create table if not exists rsvps (
  show_id    bigint not null references shows (id) on delete cascade,
  visitor_id uuid   not null,
  created_at timestamptz not null default now(),
  primary key (show_id, visitor_id)
);

create index if not exists rsvps_show_id_idx on rsvps (show_id);
