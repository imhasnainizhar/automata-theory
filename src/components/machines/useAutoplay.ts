'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const SPEEDS = [0.5, 1, 2, 4] as const;

/**
 * Shared playback state for every step-through widget: current step k in [0, last],
 * play/pause, step forward/back, rewind, and a playback speed multiplier.
 * Uses a single timeout chain (no per-frame work) and stops itself at the end.
 */
export function useStepper(last: number, baseMs: number, { autoplay = false }: { autoplay?: boolean } = {}) {
  const [k, setKRaw] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const lastRef = useRef(last);
  lastRef.current = last;

  // keep k inside the range when the run changes length (e.g. new input)
  useEffect(() => {
    setKRaw((x) => Math.min(x, last));
    if (last === 0) setPlaying(false);
  }, [last]);

  useEffect(() => {
    if (!playing) return;
    if (k >= last) { setPlaying(false); return; }
    const t = setTimeout(() => setKRaw((x) => Math.min(x + 1, lastRef.current)), baseMs / speed);
    return () => clearTimeout(t);
  }, [playing, k, last, baseMs, speed]);

  // autoplay: start from the beginning shortly after becoming visible; pause when hidden again
  useEffect(() => {
    if (!autoplay) { setPlaying(false); return; }
    setKRaw(0);
    const t = setTimeout(() => setPlaying(true), 600);
    return () => clearTimeout(t);
  }, [autoplay]);

  const setK = useCallback((v: number) => setKRaw(Math.max(0, Math.min(v, lastRef.current))), []);
  return {
    k,
    last,
    playing,
    speed,
    atStart: k <= 0,
    atEnd: k >= last,
    setK,
    /** jump back to step 0 and stop */
    rewind: () => { setPlaying(false); setKRaw(0); },
    /** start over from 0 with a new run (input changed) */
    restart: () => { setPlaying(false); setKRaw(0); },
    back: () => { setPlaying(false); setKRaw((x) => Math.max(0, x - 1)); },
    forward: () => { setPlaying(false); setKRaw((x) => Math.min(x + 1, lastRef.current)); },
    toggle: () => {
      if (playing) return setPlaying(false);
      if (k >= lastRef.current) setKRaw(0);
      setPlaying(true);
    },
    cycleSpeed: () => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]),
  };
}

export type Stepper = ReturnType<typeof useStepper>;
