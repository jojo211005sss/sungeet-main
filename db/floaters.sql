-- Hero "floaters": the artist cut-outs that drift around the landing page and
-- sing when tapped. Curated separately from teams on purpose — this is "who do
-- you want to hear", not the roster.
--
-- Managed from the Website → Floaters section of the sungeet-attendance admin.
--   npm run db:apply -- db/floaters.sql

-- Uploaded images and audio clips, stored in the database rather than a bucket.
-- There is no object storage on this project, and the admin had no upload at
-- all before this — only a "paste a URL" field, which is unusable for someone
-- without a place to host files. Assets here are small (cut-outs are
-- compressed client-side, clips are 10-15s), so a row per file is fine and
-- costs nothing to operate.
--
-- data is base64 rather than bytea: it survives every driver and JSON hop
-- between the two apps unchanged, at a 33% size cost we can afford here.
create table if not exists media (
  id         uuid        primary key default gen_random_uuid(),
  kind       text        not null check (kind in ('image', 'audio')),
  mime       text        not null,
  data       text        not null,         -- base64, no data: prefix
  byte_size  int         not null,
  filename   text,                          -- original name, for the admin list
  created_at timestamptz not null default now()
);

create table if not exists floaters (
  id         bigint      generated always as identity primary key,
  name       text        not null,
  role       text,                          -- "vocals", "guitar", "tabla", ...
  -- Cut-out of the artist, ideally a transparent PNG/WebP of the person alone.
  image_id   uuid        references media (id) on delete set null,
  -- 10-15s clip played when their cut-out is tapped.
  audio_id   uuid        references media (id) on delete set null,
  -- Fallback for either asset when nothing is uploaded: lets a floater point at
  -- a file shipped in /public instead, which is how the placeholders work.
  image_url  text,
  audio_url  text,
  sort_order int         not null default 0,
  is_active  boolean     not null default true,
  created_at timestamptz not null default now()
);

create index if not exists floaters_active_idx on floaters (is_active, sort_order);
