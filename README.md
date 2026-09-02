# Sung Sungeet — landing page

Single-page site for a Delhi NCR live-music community. Two features:

1. **Scroll walkthrough** — a pinned, scroll-scrubbed pass through five moments
   of one night, from the back of the room to load-out.
2. **Shows calendar** — upcoming dates from Neon Postgres, with an anonymous
   "I'm going" RSVP and city / event-type filters.

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

- `bookings@sungsungeet.example` — in `src/components/Booking.tsx` and `Footer.tsx`
- `https://example.com/tickets/…` — in `db/seed.sql`

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

## Accessibility

- Scene art is `aria-hidden`; the captions carry the meaning
- Scene changes announced via `aria-live="polite"`
- Skip link to the calendar
- Amber focus ring on every interactive element, visible on both the navy and
  cream halves of the page
- Filter groups are `fieldset`/`legend`; RSVP buttons carry `aria-pressed`

## API

| Route | Method | Notes |
|---|---|---|
| `/api/shows` | GET | Published, upcoming, chronological, with RSVP counts. `?visitor=<uuid>` marks which ones you're going to. Cached 60s. |
| `/api/rsvp` | POST | `{ showId, visitorId, going }`. Toggles one row. Validates the uuid. |

`visitorId` is an anonymous uuid in `localStorage` — no accounts, no personal
data. It exists so an RSVP can be undone and counted once.
