'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { buildFA, faClosure, faStep, type MachineSpec } from '@/lib/machines';
import { StateDiagram } from './StateDiagram';
import { InputBar, Panel, Transport, Verdict } from './Controls';
import { useStepper } from './useAutoplay';

const fmt = (s: Set<string>) => (s.size ? `{${[...s].join(', ')}}` : '∅');

export function FASim({
  spec,
  initial = '',
  presets,
  title,
  tag,
  caption,
  autoplay = false,
  hideTrace = false,
}: {
  spec: MachineSpec;
  initial?: string;
  presets?: string[];
  title?: ReactNode;
  tag?: string;
  caption?: ReactNode;
  autoplay?: boolean;
  hideTrace?: boolean;
}) {
  const delta = useMemo(() => buildFA(spec), [spec]);
  const accept = useMemo(() => new Set(spec.accept ?? []), [spec]);
  const [w, setW] = useState(initial);

  // every frame of the run, computed once per input
  const frames = useMemo(() => {
    const fired0 = new Set<number>();
    const out = [{ set: faClosure(delta, new Set([spec.start!]), fired0), fired: fired0 }];
    for (const a of w) {
      const { next, fired } = faStep(delta, out[out.length - 1].set, a);
      out.push({ set: next, fired });
      if (!next.size) break;
    }
    return out;
  }, [delta, spec.start, w]);

  const s = useStepper(frames.length - 1, 620, { autoplay });
  const k = Math.min(s.k, frames.length - 1);
  const cur = frames[k];
  const nondet = spec.kind === 'nfa';
  const stuck = cur.set.size === 0;
  const finished = s.atEnd && (k === w.length || stuck);
  const ok = [...cur.set].some((q) => accept.has(q));

  return (
    <Panel title={title} tag={tag} caption={caption}>
      <StateDiagram spec={spec} active={cur.set} hot={cur.fired} />
      <InputBar value={w} onChange={(v) => { setW(v); s.restart(); }} onEnter={s.toggle} presets={presets} />
      <Transport s={s} stepWord="symbol" />
      <div className="tape" aria-label="Input tape" data-scroll="x">
        {w.length === 0 && <span className="cell next">ε</span>}
        {[...w].map((c, i) => (
          <span key={i} className={`cell${i < k ? ' done' : i === k && !finished ? ' next' : ''}`}>{c}</span>
        ))}
      </div>
      <div className="status" aria-live="polite">
        {finished ? (
          <>
            <Verdict ok={ok} />{' '}
            {stuck
              ? 'No transition was available, so every path died (an implicit dead state).'
              : ok
                ? `It ended in accepting state ${[...cur.set].filter((q) => accept.has(q)).join(', ')}.`
                : `It ended in ${fmt(cur.set)}, which ${cur.set.size > 1 ? 'contains no accepting state' : 'is not accepting'}.`}
          </>
        ) : (
          <>
            {nondet ? 'Active states' : 'Current state'}: <b>{nondet ? fmt(cur.set) : [...cur.set][0]}</b>
            {' · '}next symbol <code className="inline-code">{w[k]}</code>
          </>
        )}
      </div>
      {!hideTrace && (
        <div className="trace" aria-label="Trace" data-scroll="y">
          {frames.slice(0, k + 1).map((f, i) => (
            <div key={i} className={i === k ? 'cur' : ''}>
              {i === 0 ? `start ${fmt(f.set)}` : `${fmt(frames[i - 1].set)} —${w[i - 1]}→ ${fmt(f.set)}`}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
