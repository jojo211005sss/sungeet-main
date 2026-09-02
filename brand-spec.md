# Brand spec — Sung Sungeet

Every value here was **measured from a real asset**, not chosen by eye. If you
change an asset, re-measure rather than guessing a replacement hex.

## Assets on disk

| Asset | Path | Source | Status |
|---|---|---|---|
| Logo mark | `public/brand/sunggeet-mark.png` | Supplied by the client (JPEG); disc auto-detected from the navy pixel bounds, cropped and alpha-masked to a circle at 1024×1024 | ⚠️ Raster, upscaled from a small JPEG. **Ask the client for the vector original.** |
| Favicon / touch icon | `public/brand/icon-180.png` | Downscaled from the mark | OK |
| Scene 01–05 | `public/scenes/*.jpg` | Frames pulled from the client's own Instagram screen recording | ⚠️ Placeholder — see README |

## Colour — measured

Sampled from the logo badge (`PIL`, most-common exact RGB inside the disc):

| Token | Value | Where it came from |
|---|---|---|
| `--color-navy-900` | `#091932` | The badge ground. The single most common pixel in the mark. |
| `--color-cream-50` | `#f7f4ef` | The wordmark and line art. |
| `--color-maroon-900` | `#2a0f18` | The drop shadow sitting under "SUNG गीत". Used sparingly. |

Sampled across 36 frames of the client's footage (HSV-bucketed, chromatic
pixels only). The rooms they play are overwhelmingly tungsten, hue 15–30°:

| Token | Value | Role |
|---|---|---|
| `--color-amber-400` | `#d48d46` | Primary accent. The dominant warm light in the footage. |
| `--color-rust-500` | `#aa5538` | Secondary warm. Event-type labels, date months. |
| `--color-sand-300` | `#d4b18d` | Warm neutral, 1% of *all* sampled pixels. |

Derived, not measured — navy extended into a usable ramp:
`--color-navy-950 #050c19`, `--color-navy-800 #0e2244`, `--color-navy-700 #16315c`,
`--color-cream-200 #ddd6ca`, `--color-cream-400 #9aa6bb`.

**The idea:** navy and cream are the *identity*; amber and rust are the *light
they actually play under*. Navy alone would be another dark-blue product page.
The warm accents are what tie the page to the photographs.

## Typography

| Role | Face | Why |
|---|---|---|
| Display | Instrument Serif | High-contrast editorial serif with a real italic. The logo is a geometric sans, so the page needs contrast against it, not more of it. |
| UI / body | Archivo | Grotesque with a tall x-height; holds up at 13–15px in the calendar rows. |
| Devanagari | Noto Serif Devanagari | Loaded for गीत and any Hindi that gets added. |

Not used: Inter, Roboto, system-ui as display faces.

## Voice

The band writes in Hinglish on their own reels. Verbatim from their content:
"hum har Tuesday stage", "But stage nhi h?", "biggest music community",
"open jamming", "Find people who sing louder than your overthinking",
"You won't know the vibes until you attend one".

Page copy follows that register. Do not flatten it into brochure English.

## Facts confirmed from their content

- Bio: "Delhi's own music community 🎶 Private events | Jamming | Gigs | Workshops"
- ~3,900 followers at time of writing
- Recurring Tuesday open-jam night, in collaboration with **Chords & Coffee**
- Also: private events, weddings/sangeet, club and awards-night stage shows
- Locations seen: Aerocity, Noida (Diablo), Gurugram, one8.commune

## Open questions for the client

1. Vector logo (SVG/AI/EPS)?
2. Is the site name "Sung Sungeet" (logo + IG handle) or "The Sunggeet" (used
   in the brief)? The build currently uses **Sung Sungeet**.
3. Real booking email — `bookings@sungsungeet.example` is a placeholder.
