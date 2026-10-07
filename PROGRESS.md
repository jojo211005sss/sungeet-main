# Sung Sungeet website — progress

Live: https://sungeet-main.vercel.app (deploys from `main`)
Local: `/startsungeet` → http://localhost:5173 (API on 5174)
Database: Neon, same database for local and live (`.env` → `DATABASE_URL`)

## Last session — 8 Oct 2026 (all pushed, commit 10c5467)

**Done**
- Members area: real username/password login (backend-checked, 5-try lockout,
  30-day sessions). Backstage design (lanyard pass, tape tabs, contact sheet,
  liner notes, setlist). Members button in the nav.
- Lineups: each team is a record sleeve; tap the record → tonearm drops, vinyl
  spins, showreel plays with sound. Team 1 renamed **Team Sahil** (Sahil,
  Tanmay, Ayush) with its own showreel.
- ARTIST badges (black card, round logo): swing with scroll on phones, wiggle
  on hover, swipe/tap to flip and hear them sing.
- Hidden artists page `#artists` (+ "Book artists" tab in members area): pick
  artists like a cart, send one enquiry → saved in `booking_enquiries`.
- Hero floaters: 5 real cut-outs (Ayush named, with his audio).
- Walkthrough: scene 04 = crowd clip (longer scroll), scene 03 = frame from it.
- Rooms: café panel = Tuesday jam clip with "Play with sound".

**Commands**
- `npm run member -- add <username> "<Name>"` (also `list`, `reset`, `remove`)
- `npm run enquiries` — read booking enquiries
- Demo login: username `demo` (password was shared in chat; reset with
  `npm run member -- reset demo`, remove with `npm run member -- remove demo`)

**Open / next**
- Floaters 2–5: names unknown, 3 still play placeholder sample audio.
- Dhruv: placeholder audio; he's in `src/data/artists.ts`, not the admin.
- "Sahil" merges three people with the same name on the artists page — rename
  in admin if they're different people.
- Booking enquiries aren't visible in the attendance admin; no email alert yet.
- Walkthrough headings are still casual Hinglish.
- iPhone check of the walkthrough videos never confirmed on a real device.
- Member-area content (clips, cast, origin) is still placeholder text.
