export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-navy-950 px-6 pb-14 pt-28 sm:px-10 sm:pb-20"
    >
      {/* Tungsten spill, top right — the light every one of their rooms has. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[12%] top-[-12%] h-[72vh] w-[72vh] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,141,70,0.42) 0%, rgba(170,85,56,0.20) 45%, transparent 72%)',
        }}
      />
      {/* Navy pushing back from the lower left, so the type sits on ground. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[18%] bottom-[-22%] h-[58vh] w-[58vh] rounded-full opacity-80 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(22,49,92,0.9) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl">
        <p className="font-sans text-[0.82rem] tracking-[0.24em] text-amber-400">
          Delhi&rsquo;s own music community
        </p>

        <h1
          id="hero-heading"
          className="mt-5 max-w-[16ch] font-display text-hero leading-[0.87] text-cream-50"
        >
          Har Tuesday, ek café,{' '}
          <em className="text-amber-400">aur jisko gaana hai</em> woh aa jaata
          hai
        </h1>

        <div className="mt-10 flex flex-col gap-8 border-t u-rule pt-8 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-md font-sans text-[0.95rem] leading-relaxed text-cream-400">
            Open jamming, private events, weddings and club nights across Delhi
            NCR. Jazz, Sufi, Bollywood — whatever the room turns out to want.
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href="#shows"
              className="border border-amber-400 px-6 py-3 font-sans text-[0.88rem] text-amber-400 transition-colors hover:bg-amber-400 hover:text-navy-950"
            >
              Upcoming dates
            </a>
            <a
              href="#walkthrough"
              className="font-sans text-[0.88rem] text-cream-400 underline decoration-amber-400 decoration-1 underline-offset-8 hover:text-cream-50"
            >
              Scroll through a night
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
