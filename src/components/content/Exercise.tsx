'use client';

import { useId, useState, type ReactNode } from 'react';
import { roman } from '@/lib/site';

export function Exercise({ n, level, q, children }: { n: number; level: 'easy' | 'medium' | 'hard'; q: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="ex">
      <button type="button" className="ex-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <span className="roman">{roman(n)}.</span>
        <span className="ex-q">
          {q}
          <span className="ex-toggle">{open ? 'Hide solution' : 'Show solution'}</span>
        </span>
        <span className={`lvl ${level}`}>{level}</span>
      </button>
      {open && (
        <div className="ex-body" id={id}>
          {children}
        </div>
      )}
    </div>
  );
}
