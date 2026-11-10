'use client';

import { useEffect, useRef, useState } from 'react';

/** Runs `step` on an interval while playing; `step` returns false when the run is finished. */
export function useAutoplay(step: () => boolean, ms: number) {
  const [playing, setPlaying] = useState(false);
  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      if (!stepRef.current()) setPlaying(false);
    }, ms);
    return () => clearInterval(t);
  }, [playing, ms]);
  return [playing, setPlaying] as const;
}
