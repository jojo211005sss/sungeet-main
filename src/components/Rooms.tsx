import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/useMediaQuery'

const ROOMS = [
  {
    n: '01',
    stamp: 'Every Tuesday',
    kind: 'Cafés and open jams',
    body: 'We bring the players, the café brings the room, and anyone who wants the mic gets it. Put your name down at the counter.',
    img: '/rooms/cafes.jpg',
    // No café clip yet — the two we have are from a hall date. Drop a file in
    // and set it here; the hover-to-play rig is already wired.
    video: null as string | null,
    focal: '50% 55%',
    side: 'left' as const,
    tilt: '-1.6deg',
  },
  {
    n: '02',
    stamp: 'Closed events',
    kind: 'Private events and weddings',
    body: 'Sangeet, cocktail hour, house parties, offices. The setlist gets built around your people, not our catalogue.',
    img: '/rooms/private.jpg',
    video: '/scenes/04-theroom.mp4',
    focal: '50% 40%',
    side: 'right' as const,
    tilt: '1.3deg',
  },
  {
    n: '03',
    stamp: 'Full PA',
    kind: 'Clubs and stage shows',
    body: 'Six pieces, a proper set, and the volume to match. Awards nights, club dates and festival slots across NCR.',
    img: '/rooms/stage.jpg',
    video: null as string | null,
    focal: '55% 45%',
    side: 'left' as const,
    tilt: '-0.9deg',
  },
]

/**
 * Editorial spread rather than three equal columns: each room is a tilted
 * print with a caption card overlapping its corner, an outlined numeral
 * bleeding off the edge, and a rotated stamp.
 *
 * Where a clip exists it plays on hover (desktop) or tap (touch), over the
 * still. The still is the poster, so there's never an empty frame while the
 * video loads.
 */
function RoomPanel({ room }: { room: (typeof ROOMS)[number] }) {
  const imageLeft = room.side === 'left'
  const videoRef = useRef<HTMLVideoElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // Start fetching the clip once the panel is near the viewport, so the first
  // hover plays immediately. preload="none" alone means the first hover sits
  // there fetching 1.1MB and feels broken; preload="auto" would download every
  // clip for visitors who never reach this section. This is the middle.
  useEffect(() => {
    const panel = panelRef.current
    const video = videoRef.current
    if (!panel || !video) return

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          video.preload = 'auto'
          video.load()
          io.disconnect()
        }
      },
      { rootMargin: '300px' },
    )

    io.observe(panel)
    return () => io.disconnect()
  }, [])

  const play = () => {
    const v = videoRef.current
    if (!v) return
    void v.play().catch(() => {
      /* autoplay refused — the poster still shows, so nothing breaks */
    })
  }

  const stop = () => {
    const v = videoRef.current
    if (!v) return
    v.pause()
    v.currentTime = 0
  }

  const imageCell = imageLeft
    ? 'sm:col-start-1 sm:col-span-8 sm:row-start-1'
    : 'sm:col-start-5 sm:col-span-8 sm:row-start-1'
  const captionCell = imageLeft
    ? 'sm:col-start-8 sm:col-span-5 sm:row-start-1 sm:-ml-8 lg:-ml-12'
    : 'sm:col-start-1 sm:col-span-5 sm:row-start-1 sm:-mr-8 lg:-mr-12'

  return (
    <article ref={panelRef} className="group relative">
      <div className="grid items-center gap-y-6 sm:grid-cols-12">
        <div className={`relative ${imageCell}`}>
          <div
            className="relative overflow-hidden transition-transform duration-700 ease-out group-hover:!rotate-0 motion-reduce:!rotate-0"
            style={{ rotate: room.tilt }}
            onMouseEnter={reduced ? undefined : play}
            onMouseLeave={reduced ? undefined : stop}
          >
            <img
              src={room.img}
              alt=""
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
              style={{ objectPosition: room.focal }}
            />

            {room.video && (
              <video
                ref={videoRef}
                src={room.video}
                poster={room.img}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ objectPosition: room.focal }}
              />
            )}

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-navy-950/25"
            />

            {/* Touch devices have no hover, so give them something to press. */}
            {room.video && (
              <button
                type="button"
                onClick={() => {
                  const v = videoRef.current
                  if (!v) return
                  if (v.paused) {
                    v.classList.add('opacity-100')
                    play()
                  } else {
                    v.classList.remove('opacity-100')
                    stop()
                  }
                }}
                className="absolute bottom-3 left-3 z-20 border border-cream-50/40 bg-navy-950/70 px-3 py-1.5 font-sans text-[0.65rem] uppercase tracking-[0.18em] text-cream-50 backdrop-blur-sm sm:hidden"
              >
                ▶ Play
              </button>
            )}
          </div>

          <span
            className={`absolute -top-3 z-20 border border-amber-400 bg-navy-950 px-3 py-1.5 font-sans text-[0.62rem] uppercase tracking-[0.22em] text-amber-400 ${
              imageLeft ? 'left-4 sm:left-8' : 'right-4 sm:right-8'
            }`}
            style={{ rotate: imageLeft ? '-3deg' : '3deg' }}
          >
            {room.stamp}
          </span>
        </div>

        <div className={`relative z-10 ${captionCell}`}>
          <div className="border u-rule bg-navy-950/95 p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] sm:p-7">
            <h3 className="font-display text-[1.7rem] leading-[1.05] sm:text-[2.1rem]">
              {room.kind}
            </h3>
            <p className="mt-4 font-sans text-[0.9rem] leading-relaxed text-cream-400">
              {room.body}
            </p>
          </div>
        </div>
      </div>

      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-8 hidden select-none font-display text-[9rem] leading-none text-transparent sm:block lg:text-[12rem] ${
          imageLeft ? '-right-2' : '-left-2'
        }`}
        style={{ WebkitTextStroke: '1px rgba(212,141,70,0.38)' }}
      >
        {room.n}
      </span>
    </article>
  )
}

/* -------------------------------------------------------------- export ---- */

export default function Rooms({
  enquiryTeam,
  onClearEnquiry,
}: {
  /** Set when someone pressed "Book them" on a team card. */
  enquiryTeam: string | null
  onClearEnquiry: () => void
}) {
  const subject = enquiryTeam
    ? `Booking enquiry — ${enquiryTeam}`
    : 'Booking enquiry'

  const body = [
    enquiryTeam ? `We'd like to book ${enquiryTeam}.` : '',
    '',
    'Room / venue:',
    'Date:',
    'Roughly how many people:',
    'Anything else:',
    '',
  ]
    .filter((line, i, all) => !(line === '' && all[i - 1] === ''))
    .join('\n')

  const mailto = `mailto:bookings@sungsungeet.example?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`

  return (
    <section
      id="book"
      aria-labelledby="book-heading"
      className="scroll-mt-16 overflow-hidden border-t u-rule bg-navy-950 text-cream-50"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-10 sm:py-28">
        <header className="max-w-3xl">
          <p className="font-sans text-[0.72rem] uppercase tracking-[0.24em] text-amber-400">
            Where we play
          </p>
          <h2
            id="book-heading"
            className="mt-4 font-display text-section leading-[0.92]"
          >
            Teen tarah ke rooms, <em className="text-amber-400">ek hi band</em>
          </h2>
        </header>

        <div className="mt-20 space-y-24 sm:space-y-32">
          {ROOMS.map((room) => (
            <RoomPanel key={room.kind} room={room} />
          ))}
        </div>

        <div className="mt-24 border-t u-rule pt-8">
          {enquiryTeam && (
            <div className="mb-8 flex flex-wrap items-center gap-4 border border-amber-400/50 bg-navy-900 px-5 py-4">
              <span className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-amber-400">
                Enquiring about
              </span>
              <span className="font-display text-[1.4rem] text-cream-50">
                {enquiryTeam}
              </span>
              <button
                type="button"
                onClick={onClearEnquiry}
                className="ml-auto font-sans text-[0.78rem] text-cream-400 underline underline-offset-4 hover:text-cream-50"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-lg font-display text-[1.6rem] leading-snug sm:text-[2rem]">
              {enquiryTeam
                ? `Tell us the room and the date, and we'll come back with what ${enquiryTeam} would play.`
                : "Tell us the room, the date, and roughly how many people. We'll send back a set plan and a number."}
            </p>
            <a
              href={mailto}
              className="shrink-0 border border-amber-400 px-6 py-3 font-sans text-[0.88rem] text-amber-400 transition-colors hover:bg-amber-400 hover:text-navy-950"
            >
              Start an enquiry
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
