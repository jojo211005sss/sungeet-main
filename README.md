# Sung Sungeet — landing page

Single-page site for a Delhi NCR live-music community.

1. **Scroll walkthrough** — a pinned, scroll-scrubbed pass through five moments
   of one night, from the back of the room to load-out.
2. **Calendar** — a horizontal day strip (01–30) over a month grid. Tap a date
   in either and it opens a poster-led event card showing the venue, the team
   playing and that night's lineup; back returns to the month. Filters by team,
   city and event type.
3. **Teams** — each lineup with its members, photo and showreel, and a link
   through to their dates.
4. **Rooms** — three full-bleed photo panels for the kinds of gigs they play.
5. **Community** — a members-only section behind an approval gate. The public
   part shows what's inside (behind the scenes, meet the cast, how it started)
   and takes join requests; the gated portal itself is **not built yet**.
6. **Join us** — a prefilled mailto for people who want to play.

React + Vite + Tailwind v4, GSAP ScrollTrigger + Lenis, deployed on Vercel.
Stack and conventions follow the existing `sungeet-attendance` repo.

---

## Run it

```bash
npm install
npm run dev
```

The calendar falls back to seed data when there's no API, so `npm run dev`
gives you the full page with no database. To exercise the real API locally you
need the Vercel CLI (it runs the functions in `api/`):

```bash
npm i -g vercel && vercel dev
```

---

## ⚠️ What still needs swapping in

### 1. Scene photography — placeholder

`public/scenes/01-room.jpg` … `05-after.jpg` are **frames lifted from a screen
recording of the band's own Instagram**. They are the right content and the
right colour, but they are not production assets:

- phone-video resolution, re-compressed through Instagram
- some still carry burned-in reel captions ("hum har Tuesday stage")
- vertical 9:16, so they crop hard in a landscape viewport

**What to send to replace them:** five landscape (or at minimum 4:5) stills at
1600px or wider, straight from the camera roll — no Instagram export — one for
each moment:

| File | Moment |
|---|---|
| `01-room.jpg` | Wide, from the back of the crowd |
| `02-forward.jpg` | Pushing forward through the crowd toward the stage |
| `03-stage.jpg` | Close on the performer |
| `04-theroom.jpg` | Reverse angle — from beside the performer, looking out |
| `05-after.jpg` | After the set, quiet |

Drop them in at the same paths and adjust `focal` in
`src/scenes/Scenes.tsx` (that's the `object-position` per scene, so the subject
survives any aspect ratio).

**If you send video clips instead**, the walkthrough can be upgraded from
crossfade to a true canvas frame-scrub. That was the better option in the brief
and it is not built, for one reason: a scrub needs continuous footage of each
moment, and the source recording is a screen capture of a feed, not a shot.
Send ~2–4s clips per moment and it becomes worth doing.

### 2. Logo — raster

`public/brand/sunggeet-mark.png` was extracted from the JPEG you sent (disc
auto-detected, alpha-masked). It's upscaled raster. **Send the vector original**
if it exists — the mark sits at 44px in the nav where the raster edges show.

### 3. Database — not connected

```bash
cp .env.example .env
# paste your Neon pooled connection string into DATABASE_URL
```

Then create the tables and (optionally) the sample rows:

```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
```

`db/seed.sql` contains **made-up dates and venues**. Replace them with real
ones before this goes anywhere public.

On Vercel, add `DATABASE_URL` to the project (Production + Preview):

```bash
vercel env add DATABASE_URL
```

### 4. Placeholder contact details

- `bookings@sungsungeet.example` — in `Rooms.tsx` and `Footer.tsx`
- `join@sungsungeet.example` — in `JoinUs.tsx` and `Footer.tsx`
- `https://example.com/tickets/…` — in `db/seed.sql`

### 4a. Community portal is a front door only

The join-request form works, but there is no member login and no gated
content. Deciding how members authenticate is the next open decision.

### 4b. Team names are invented

"The Tuesday Trio", "Sufi Collective", "The Full Band" and every member name in
`db/seed.sql` and `src/data/teams.ts` are **made up**. Replace them with the
real lineups.

### 5. Name

The brief says "The Sunggeet"; the logo and Instagram handle say "Sung
Sungeet". The build uses **Sung Sungeet**. Say the word and it's a one-line
change in `Nav.tsx`, `Footer.tsx` and `index.html`.

---

## Where the images and colours came from

Instagram blocks automated access to post media — the logged-out page HTML
contains only Instagram's own UI assets. So nothing here was sampled from the
live profile. Instead:

- **Colour** was measured with PIL: the logo badge for navy / cream / maroon,
  and 36 frames of the supplied screen recording for the tungsten accents.
  Full table in [`brand-spec.md`](./brand-spec.md).
- **Copy** follows the Hinglish register the band actually writes in.

No palette in this repo was picked by eye.

---

## How the walkthrough works

`src/components/ScrollWalkthrough.tsx` renders one of three paths:

| Condition | Behaviour |
|---|---|
| `prefers-reduced-motion: reduce` | **No pin, no scrub, no parallax.** Five plain stacked sections. Same content, same order. |
| viewport < 768px | 340vh track, crossfade + a slow whole-scene drift. One composited layer per scene rather than five — deliberately cheap. |
| desktop | 520vh track, crossfade + per-layer parallax driven by `data-depth`. |

Lenis is only instantiated when reduced motion is off — smoothing *is* motion.

Scene copy lives in `src/data/scenes.ts`, art in `src/scenes/Scenes.tsx`.

## Team media: the flip-through stack

`src/components/MediaStack.tsx`. Each team card is a stack of media you turn
through like pages in a notebook — the next card peeks out behind the top one,
and tapping, dragging left, or the arrow keys turns the top one away around its
left edge.

Slot 0 is always the showreel; the rest are photos. Everything is a
placeholder right now (`src: null` renders a face that says what belongs
there). The data lives in `teams.media` as ordered slots, and in Postgres as
`site_teams.media` jsonb — so swapping real media in is a data change.

Two things worth knowing if you touch this:

- Turns **queue**. Tapping fast spawns a second animating card rather than
  dropping the tap. An earlier version gated on "one turn at a time" and every
  other tap was silently ignored.
- The outgoing card is keyed on a turn counter. Without a fresh key React
  reuses the node, the one-shot CSS animation never replays, `animationend`
  never fires, and the stack jams permanently. There's a timeout as a second
  safety net.
- Pointer input is handled in `onPointerUp`; `onClick` only acts when
  `e.detail === 0` (keyboard or programmatic). A real tap fires both, which
  otherwise turns two pages at once.

## Member area (PROTOTYPE — not authentication)

`#member` renders `src/components/MemberArea.tsx`: a mock sign-in and the
gated portal (behind the scenes / meet the cast / how it started), so the flow
and UI can be judged before committing to a real auth approach.

**The sign-in accepts anything.** `src/lib/useMockMember.ts` writes a fake
session to localStorage and verifies nothing. Two things deliberately stop this
becoming a security hole if it ever ships:

1. **Nothing real is behind it.** The portal renders local placeholder content
   from `src/data/portal.ts` — no API call, no media URL, no secret.
2. **The sign-in screen prints its own demo credentials**, so it cannot be
   mistaken for a working gate. A red banner sits on every member screen.

### Before this becomes real

Gating the page is not gating the content. If the behind-the-scenes clips end
up at guessable CDN URLs, a login is decoration — one shared link and they're
public. Real media needs **signed, expiring URLs** (Vercel Blob, S3) or
**signed playback tokens** (Cloudflare Stream, Mux, which also give adaptive
quality and suit the "instant load" requirement better than raw files).

Auth options were laid out in conversation; the leading recommendation is
magic links / email codes against an approved-email list — no passwords to
forget, leak or reset, and fans stay out of the staff database entirely.
Not yet decided.

## Community section

`src/components/Community.tsx` + `api/community-request.ts` +
`community_requests` in `db/schema.sql`.

Requests are stored as `pending` for a human to approve. **No credentials are
issued or stored by this site** — the table holds no password or token, and
approving a request is a staff action.

**Not built:** member sign-in and the gated portal itself. The section says so
rather than linking to a login that doesn't exist.

## Calendar: visual direction

This section is deliberately styled apart from the rest of the page — thin gold
rules, bordered boxes, letterspaced caps, tabular day numbers — after the
Piano Man reference. It keeps the brand navy as the ground rather than adopting
their near-black and tan, so it reads as Sung Sungeet rather than as a copy of
a venue that is itself on the calendar.

Note that the whole page is now dark; the cream calendar that used to break it
up is gone. If it wants a light section back, the Teams block is the natural
candidate.

The caps are a system here (every UI label in this section), not decorative
eyebrow labels — the thing the original brief warned against.

### Event posters

`shows.poster_url` holds portrait artwork (roughly 3:4) per event, uploaded by
the staff backend. When it's null the card falls back to a typographic panel
built from the venue and set name rather than faking a poster — so an
undesigned date still looks deliberate. No real posters are wired in yet.

## Calendar behaviour

- Only months that actually contain shows are reachable; the arrows disable at
  each end rather than paging into empty months forever.
- Dates are keyed by **IST civil date**, so a 9pm Delhi show never lands on the
  previous day for a viewer abroad.
- Days with shows are buttons with a full aria-label ("19 September: 1 show,
  The Piano Man"); empty days are inert.
- Opening a date moves focus to the back button so keyboard users aren't
  stranded.
- Phones show a dot per show; tablet up shows the venue name in the cell.
- The day strip auto-centres on the selected date (or the month's first show),
  so on a phone you aren't left staring at the 1st when the gig is on the 19th.
- All 31 days fit across the strip on desktop; it scrolls, scrollbar hidden, on
  narrow screens.

## Accessibility

- Scene art is `aria-hidden`; the captions carry the meaning
- Scene changes announced via `aria-live="polite"`
- Skip link to the calendar
- Amber focus ring on every interactive element, visible on both the navy and
  cream halves of the page
- Filter groups are `fieldset`/`legend`; RSVP buttons carry `aria-pressed`

## Architecture: this site is read-only

A separate **staff/manager backend** will own the schedule. Managers enter
dates, assign a team and adjust the per-date lineup there; this public site
only reads. The two share the Neon database — `db/schema.sql` is the contract.

The only table this site writes to is `rsvps`.

### The 24-hour refresh

Because the schedule changes at most daily, the two managed endpoints are
cached at the edge for a day:

| Route | Method | Cache | Notes |
|---|---|---|---|
| `/api/shows` | GET | `s-maxage=86400`, SWR | Upcoming shows with team and lineup. |
| `/api/teams` | GET | `s-maxage=86400`, SWR | Active teams with default rosters. |
| `/api/rsvp-state` | GET | **none** | Live counts + whether this visitor is going. |
| `/api/rsvp` | POST | — | Toggles one row. Validates the uuid. |

RSVP state is deliberately a **separate, uncached** request. If counts rode
along with `/api/shows` they'd be frozen for a day and the "I'm going" number
would look broken.

To publish a schedule change sooner than the daily rotation, purge the Vercel
cache for those paths or redeploy.

`visitorId` is an anonymous uuid in `localStorage` — no accounts, no personal
data. It exists so an RSVP can be undone and counted once.

## Teams and per-date lineups

A show points at a **team** (`shows.team_id`). The team has a default roster in
`team_members`. When a specific night differs — someone's away, someone sits
in — the staff tool writes rows into `show_lineup` for that show, and those
**replace** the default roster for that date only. The site shows "Lineup
adjusted for this date." whenever an override exists.

## Team media — still to decide

Team photos and showreels render placeholders right now (`photo_url` /
`video_url` are null). You said you want these to load instantly, which rules
out hotlinking Instagram. When you're ready, the realistic options are:

- **Vercel Blob** — upload once, served from the edge CDN, immutable URLs. Best
  fit for "instant" with no build step.
- **Files in `public/`** — fastest possible and cached forever, but every media
  change needs a redeploy and the repo grows.

Either way the site only needs a URL per team, so switching is a data change,
not a code change. Poster images matter more than the video itself for
perceived speed — send a still per team even if the clip comes later.
