'use client';

import { useState, type ReactNode } from 'react';
import { accepts, type MachineSpec } from '@/lib/machines';
import { Panel } from '../machines/Controls';

/** Predict accept/reject for each string, then let the machine decide. */
export function StringQuiz({ spec, strings, title, caption }: { spec: MachineSpec; strings: string[]; title?: ReactNode; caption?: ReactNode }) {
  const [guess, setGuess] = useState<Record<string, boolean | undefined>>({});
  const [shown, setShown] = useState(false);
  const truth = (w: string) => accepts(spec, w) === true;
  const score = strings.filter((w) => guess[w] === truth(w)).length;

  return (
    <Panel tag="Predict" title={title ?? 'Will the machine accept?'} caption={caption ?? 'Tap ✓ or ✗ for every string, then check. Predicting before you run is the fastest way to build intuition.'}>
      <div style={{ display: 'grid', gap: 6 }}>
        {strings.map((w) => {
          const g = guess[w];
          const right = shown && g === truth(w);
          const wrongAns = shown && g !== undefined && g !== truth(w);
          return (
            <div key={w || 'eps'} className={`result${right ? ' ok' : wrongAns ? ' bad' : ''}`} style={{ height: 'auto', padding: '6px 8px 6px 12px' }}>
              <span style={{ fontSize: 15 }}>{w || 'ε'}</span>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {shown && <small style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{truth(w) ? 'accepted' : 'rejected'}</small>}
                <button type="button" className={`toggle${g === true ? ' on' : ''}`} onClick={() => { setGuess({ ...guess, [w]: true }); setShown(false); }} aria-label={`Predict ${w || 'ε'} is accepted`}>✓</button>
                <button type="button" className={`toggle${g === false ? ' on' : ''}`} style={g === false ? { background: 'var(--clay)', borderColor: 'var(--clay)' } : undefined}
                  onClick={() => { setGuess({ ...guess, [w]: false }); setShown(false); }} aria-label={`Predict ${w || 'ε'} is rejected`}>✗</button>
              </span>
            </div>
          );
        })}
      </div>
      <div className="controls">
        <button type="button" className="pill-btn primary" onClick={() => setShown(true)}>Check predictions</button>
        <button type="button" className="pill-btn" onClick={() => { setGuess({}); setShown(false); }}>Clear</button>
        {shown && <span className={`verdict ${score === strings.length ? 'ok' : 'bad'}`}>{score} / {strings.length} correct</span>}
      </div>
    </Panel>
  );
}
