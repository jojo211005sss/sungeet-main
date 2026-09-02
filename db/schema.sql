-- The Sunggeet — shows + RSVPs
-- Run once against the Neon branch:  psql "$DATABASE_URL" -f db/schema.sql

create table if not exists shows (
  id           bigint generated always as identity primary key,
  starts_at    timestamptz not null,
  venue        text        not null,
  city         text        not null,
  -- 'cafe' | 'private' | 'community'
  event_type   text        not null check (event_type in ('cafe', 'private', 'community')),
  set_name     text,                       -- e.g. 'Jazz standards + Sufi second set'
  note         text,                       -- free text shown under the venue
  ticket_url   text,                       -- null = no ticketing, walk in
  is_published boolean     not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists shows_starts_at_idx on shows (starts_at);

-- One row per visitor per show. visitor_id is an anonymous uuid minted in the
-- browser and kept in localStorage — no accounts, no personal data.
create table if not exists rsvps (
  show_id    bigint not null references shows (id) on delete cascade,
  visitor_id uuid   not null,
  created_at timestamptz not null default now(),
  primary key (show_id, visitor_id)
);

create index if not exists rsvps_show_id_idx on rsvps (show_id);
