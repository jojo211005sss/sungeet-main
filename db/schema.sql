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
  -- The id of the show in the sungeet-attendance database this was published
  -- from. The two apps use SEPARATE databases, so this is a soft link, not a
  -- foreign key. It exists so a manager enters a gig once, in attendance, and
  -- the Website section decorates it rather than creating a second record
  -- that drifts out of sync.
  source_show_id text unique,
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

-- ------------------------------------------------------ community access ----

-- Requests to join the members-only community section. The public site only
-- INSERTs here; approving a request and issuing credentials is a staff action.
-- No password or token is ever stored in this table.
create table if not exists community_requests (
  id          bigint generated always as identity primary key,
  name        text not null,
  email       text not null unique,
  phone       text,
  message     text,
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  -- Who approved it. Plain text, not a foreign key: this database is the
  -- website's own and has no staff `users` table — that lives in the
  -- sungeet-attendance database.
  reviewed_by text,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists community_requests_status_idx
  on community_requests (status);

-- People who can sign in to the members section. Created by hand with
-- `npm run member -- add <username> "<Name>"`; there is no self sign-up.
-- password_hash is scrypt — see api/_member.ts.
create table if not exists members (
  id               bigint generated always as identity primary key,
  username         text        not null unique,
  name             text        not null,
  password_hash    text        not null,
  is_active        boolean     not null default true,
  -- Brute-force brake: 5 wrong passwords locks the account for 15 minutes.
  failed_attempts  int         not null default 0,
  locked_until     timestamptz,
  created_at       timestamptz not null default now()
);

-- One row per signed-in browser. The cookie holds a random token; only its
-- sha256 is stored, so a leaked table can't be replayed as sessions.
create table if not exists member_sessions (
  token_hash  text        primary key,
  member_id   bigint      not null references members (id) on delete cascade,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists member_sessions_member_id_idx
  on member_sessions (member_id);

-- ------------------------------------------------------ booking enquiries ----

-- Sent from the artists page: someone picks artists like a shopping list and
-- sends one enquiry for all of them. The public site only INSERTs here.
create table if not exists booking_enquiries (
  id          bigint generated always as identity primary key,
  name        text        not null,
  email       text,
  phone       text,
  event_date  date,
  city        text,
  event_type  text,
  guests      int,
  message     text,
  -- Artist names as shown on the site at the time of asking.
  artists     jsonb       not null,
  status      text        not null default 'new'
                check (status in ('new', 'replied', 'booked', 'closed')),
  created_at  timestamptz not null default now(),
  check (email is not null or phone is not null)
);

create index if not exists booking_enquiries_created_at_idx
  on booking_enquiries (created_at desc);
