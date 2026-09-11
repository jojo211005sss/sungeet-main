import type { Singer } from '../data/singers'

/**
 * The stage on the right: a framed, footlit proscenium the selected artist
 * travels onto. The artist cut-out itself is rendered by ArtistField (it docks
 * to this frame's centre); this draws the frame, the spotlight and the
 * nameplate. Editorial navy/amber to match the rest of the site — no glass
 * globe, no gloss.
 */
export default function StageFrame({
  singer,
  playing,
}: {
  singer: Singer
  playing: boolean
}) {
  return (
    <div className="pointer-events-none absolute left-[80%] top-1/2 z-10 h-[26rem] w-[15rem] -translate-x-1/2 -translate-y-1/2 sm:h-[30rem] sm:w-[17rem]">
      {/* frame */}
      <div className="absolute inset-0 border u-rule bg-navy-900/40 backdrop-blur-[1px]" />
      <div className="absolute inset-[6px] border border-amber-400/25" />

      {/* soft top spotlight + warm footlights */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-3/4 transition-opacity duration-700 ${playing ? 'opacity-100' : 'opacity-70'}`}
        style={{
          background:
            'radial-gradient(60% 55% at 50% 0%, rgba(231,220,200,0.16), transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-2/5 transition-opacity duration-700 ${playing ? 'opacity-100' : 'opacity-60'}`}
        style={{
          background:
            'radial-gradient(70% 80% at 50% 100%, rgba(212,141,70,0.42), transparent 72%)',
        }}
      />

      {/* stage floor line */}
      <div
        aria-hidden="true"
        className="absolute inset-x-6 bottom-[5.5rem] h-px bg-amber-400/40"
      />

      {/* label */}
      <span className="absolute left-1/2 top-4 -translate-x-1/2 font-sans text-[0.6rem] uppercase tracking-[0.28em] text-amber-400/80">
        {playing ? 'On stage' : 'Up next'}
      </span>

      {/* nameplate */}
      <div className="absolute inset-x-0 bottom-5 text-center">
        <p className="font-display text-[1.7rem] leading-none text-cream-50">
          {singer.name}
        </p>
        <p className="mt-1.5 font-sans text-[0.66rem] uppercase tracking-[0.2em] text-amber-400">
          {singer.role}
        </p>
      </div>
    </div>
  )
}
