'use client';

import { useEffect, useState } from 'react';

const KEY = 'wa-splash-seen';

/**
 * First-load screen. It is part of the server HTML, so it covers the page before anything paints.
 * An inline script hides it immediately on later loads in the same session; otherwise it plays a
 * short "run the machine" animation and then shrinks away through a circular mask.
 */
export function Splash() {
  const [phase, setPhase] = useState<'show' | 'leaving' | 'gone'>('show');

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === '1'; } catch { /* storage unavailable */ }
    if (seen || document.documentElement.classList.contains('splash-seen')) return setPhase('gone');
    const started = performance.now();
    let cancelled = false;
    const leave = () => {
      if (cancelled) return;
      const wait = Math.max(0, 1500 - (performance.now() - started));
      setTimeout(() => {
        if (cancelled) return;
        setPhase('leaving');
        try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
        setTimeout(() => !cancelled && setPhase('gone'), 750);
      }, wait);
    };
    // wait for web fonts (bounded) so the page underneath is settled when revealed
    Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1800))]).then(leave);
    return () => { cancelled = true; };
  }, []);

  if (phase === 'gone') return null;
  return (
    <div className={`splash${phase === 'leaving' ? ' leaving' : ''}`} role="status" aria-label="Loading WhatAutomata">
      <svg className="splash-machine" viewBox="0 0 240 90" aria-hidden="true">
        <path className="sp-start" d="M8 45h26" />
        <path className="sp-start-head" d="m28 39 7 6-7 6" />
        <circle className="sp-s1" cx="58" cy="45" r="22" />
        <path className="sp-edge" d="M82 45h72" />
        <path className="sp-edge-head" d="m147 38 8 7-8 7" />
        <circle className="sp-token" cx="82" cy="45" r="5" />
        <circle className="sp-s2" cx="182" cy="45" r="22" />
        <circle className="sp-s2-inner" cx="182" cy="45" r="16" />
      </svg>
      <div className="splash-name">What<em>Automata</em></div>
      <div className="splash-note">warming up the machines…</div>
    </div>
  );
}

/** Inline in <head>: mark repeat visits before first paint so the splash never flashes. */
export const splashScript = `try{if(sessionStorage.getItem('${KEY}')==='1')document.documentElement.classList.add('splash-seen')}catch(e){}`;
