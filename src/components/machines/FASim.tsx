'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildFA, faClosure, faStep, type MachineSpec } from '@/lib/machines';
import { StateDiagram } from './StateDiagram';
import { Panel, SimControls, Verdict } from './Controls';
import { useAutoplay } from './useAutoplay';

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
  const [k, setK] = useState(0);

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

  const last = frames.length - 1;
  const done = k >= last;
  const [playing, setPlaying] = useAutoplay(() => {
    if (k >= last) return false;
    setK(k + 1);
    return k + 1 < last;
  }, 560);

  useEffect(() => {
    if (autoplay) {
      setK(0);
      const t = setTimeout(() => setPlaying(true), 700);
      return () => clearTimeout(t);
    }
  }, [autoplay, setPlaying]);

  const cur = frames[Math.min(k, last)];
  const nondet = spec.kind === 'nfa';
  const stuck = cur.set.size === 0;
  const finished = done && (k === w.length || stuck);
  const ok = [...cur.set].some((q) => accept.has(q));

  const change = (v: string) => { setW(v); setK(0); setPlaying(false); };

  return (
    <Panel title={title} tag={tag} caption={caption}>
      <StateDiagram spec={spec} active={cur.set} hot={cur.fired} />
      <SimControls
        value={w}
        onChange={change}
        presets={presets}
        onReset={() => { setK(0); setPlaying(false); }}
        onStep={() => setK((x) => Math.min(x + 1, last))}
        canStep={!done}
        playing={playing}
        onTogglePlay={() => {
          if (playing) return setPlaying(false);
          if (done) setK(0);
          setPlaying(true);
        }}
      />
      <div className="tape" aria-label="Input tape">
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
        <div className="trace" aria-label="Trace">
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
