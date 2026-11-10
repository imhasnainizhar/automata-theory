/** Decorative organic shapes, hand-drawn arrows and state circles behind the page. */
export function BgArt({ variant = 'subtle' }: { variant?: 'hero' | 'subtle' }) {
  const hero = variant === 'hero';
  return (
    <div className={`bg-art${hero ? ' bg-hero' : ''}`} aria-hidden="true">
      {/* moss blob, top right */}
      <svg viewBox="0 0 400 400" style={{ width: hero ? 560 : 420, right: hero ? -140 : -180, top: hero ? -120 : -160, color: 'rgba(86,112,63,.13)' }}>
        <path className="blob" d="M318 72c46 40 62 112 38 170s-88 104-158 104S58 300 40 236 46 104 98 64s174-32 220 8Z" />
      </svg>
      {/* clay blob, left */}
      <svg viewBox="0 0 400 400" style={{ width: hero ? 420 : 340, left: hero ? -170 : -200, top: hero ? 380 : 520, color: 'rgba(191,106,66,.11)' }}>
        <path className="blob" d="M296 88c40 36 50 104 30 158s-72 98-134 96-118-48-128-110 26-126 82-152 110-28 150 8Z" />
      </svg>
      {/* ochre pebble, bottom right */}
      <svg viewBox="0 0 200 200" style={{ width: 220, right: '8%', bottom: hero ? -60 : -90, color: 'rgba(200,146,58,.14)' }}>
        <path className="blob" d="M150 40c24 22 30 64 14 96s-56 50-92 42-54-44-46-80 40-62 70-66 30-14 54 8Z" />
      </svg>

      {/* hand-drawn curved arrow */}
      <svg viewBox="0 0 220 120" style={{ width: hero ? 230 : 180, left: hero ? '41%' : '3%', top: hero ? 96 : 120, color: 'rgba(85,76,65,.32)' }} className="doodle">
        <path className="stroke" d="M8 96C40 30 120 8 196 40" strokeDasharray="1 7" strokeWidth="2.2" />
        <path className="stroke" d="m182 26 16 15-20 6" />
      </svg>
      {/* loopy arrow, right side */}
      <svg viewBox="0 0 160 200" style={{ width: 130, right: hero ? '3%' : '1.5%', top: hero ? '62%' : '46%', color: 'rgba(191,106,66,.38)' }} className="doodle">
        <path className="stroke" d="M120 10C60 20 20 60 46 92s76 6 58-22-74 4-62 62c6 30 30 50 56 56" />
        <path className="stroke" d="m86 176 14 12-17 6" />
      </svg>

      {/* little state diagram doodle */}
      <svg viewBox="0 0 220 90" style={{ width: 210, left: hero ? '4%' : '1%', bottom: hero ? '10%' : '7%', color: 'rgba(86,112,63,.34)' }} className="doodle">
        <circle className="stroke" cx="30" cy="50" r="18" />
        <circle className="stroke" cx="110" cy="50" r="18" />
        <circle className="stroke" cx="190" cy="50" r="18" />
        <circle className="stroke" cx="190" cy="50" r="12" />
        <path className="stroke" d="M50 50h38M130 50h38" />
        <path className="stroke" d="m82 44 8 6-8 6M162 44l8 6-8 6" />
        <path className="stroke" d="M100 33c-4-26 24-26 20 0" />
      </svg>
      {/* dotted ring */}
      <svg viewBox="0 0 100 100" style={{ width: 90, right: hero ? '42%' : '14%', bottom: hero ? '6%' : '22%', color: 'rgba(79,127,128,.35)' }} className="doodle">
        <circle className="stroke" cx="50" cy="50" r="40" strokeDasharray="2 8" strokeWidth="2.4" />
      </svg>
      {/* tiny sparkle crosses */}
      <svg viewBox="0 0 40 40" style={{ width: 26, left: '22%', top: hero ? '72%' : '30%', color: 'rgba(200,146,58,.6)' }} className="doodle">
        <path className="stroke" d="M20 6v28M6 20h28" strokeWidth="2.4" />
      </svg>
      <svg viewBox="0 0 40 40" style={{ width: 18, right: '28%', top: hero ? 140 : '70%', color: 'rgba(191,106,66,.55)' }} className="doodle">
        <path className="stroke" d="M20 6v28M6 20h28" strokeWidth="2.6" />
      </svg>
    </div>
  );
}

/** A hand-drawn underline used under hero words. */
export function Scribble() {
  return (
    <svg viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4 20C70 6 160 4 296 14" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M40 26c60-8 140-10 220-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

/** Hand-drawn arrow pointing at something, used near buttons. */
export function PointerArrow() {
  return (
    <svg viewBox="0 0 60 40" aria-hidden="true">
      <path d="M4 34C14 14 30 6 52 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m44 2 9 6-8 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
