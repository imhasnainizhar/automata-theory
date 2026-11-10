'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BLANK, LEFT_END, RIGHT_END, buildTM, isDeterministicTM, tmConfigString, tmInitial, tmKey, tmSuccessors,
  type MachineSpec, type TMConfig,
} from '@/lib/machines';
import { StateDiagram } from './StateDiagram';
import { Panel, SimControls, Verdict } from './Controls';
import { useAutoplay } from './useAutoplay';

const MAX_STEPS = 3000;
const MAX_LEVELS = 80;
const MAX_WORLDS = 48;

type Outcome = 'accept' | 'reject' | 'running' | 'limit';

export function TMSim({
  spec,
  initial = '',
  presets,
  title,
  tag,
  caption,
  autoplay = false,
  speed = 300,
}: {
  spec: MachineSpec;
  initial?: string;
  presets?: string[];
  title?: ReactNode;
  tag?: string;
  caption?: ReactNode;
  autoplay?: boolean;
  speed?: number;
}) {
  const delta = useMemo(() => buildTM(spec), [spec]);
  const det = useMemo(() => isDeterministicTM(delta), [delta]);
  const accept = useMemo(() => new Set(spec.accept ?? []), [spec]);
  const reject = useMemo(() => new Set(spec.reject ?? []), [spec]);
  const [w, setW] = useState(initial);
  const [k, setK] = useState(0);

  /** deterministic: a list of configurations; nondeterministic: a list of frontiers */
  const sim = useMemo(() => {
    const start = tmInitial(spec, w);
    if (det) {
      const seq: TMConfig[] = [start];
      let outcome: Outcome = 'running';
      while (true) {
        const c = seq[seq.length - 1];
        if (accept.has(c.q)) { outcome = 'accept'; break; }
        if (reject.has(c.q)) { outcome = 'reject'; break; }
        const next = tmSuccessors(spec, delta, c);
        if (!next.length) { outcome = 'reject'; break; }
        if (seq.length > MAX_STEPS) { outcome = 'limit'; break; }
        seq.push(next[0]);
      }
      return { frames: seq.map((c) => [c]), outcome };
    }
    const frames: TMConfig[][] = [[start]];
    let outcome: Outcome = 'running';
    while (true) {
      const f = frames[frames.length - 1];
      if (f.some((c) => accept.has(c.q))) { outcome = 'accept'; break; }
      const seen = new Set<string>();
      const next: TMConfig[] = [];
      for (const c of f) {
        if (reject.has(c.q)) continue;
        for (const n of tmSuccessors(spec, delta, c)) {
          const key = tmKey(n);
          if (seen.has(key)) continue;
          seen.add(key);
          next.push(n);
        }
      }
      if (!next.length) { outcome = 'reject'; break; }
      if (frames.length > MAX_LEVELS) { outcome = 'limit'; break; }
      frames.push(next.slice(0, MAX_WORLDS));
    }
    return { frames, outcome };
  }, [spec, delta, det, w, accept, reject]);

  const last = sim.frames.length - 1;
  const done = k >= last;
  const [playing, setPlaying] = useAutoplay(() => {
    if (k >= last) return false;
    setK(k + 1);
    return k + 1 < last;
  }, det ? speed : 750);

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => setPlaying(true), 700);
    return () => clearTimeout(t);
  }, [autoplay, setPlaying]);

  const frame = sim.frames[Math.min(k, last)];
  const active = new Set(frame.map((c) => c.q));
  const hot = new Set(frame.filter((c) => c.g !== null).map((c) => c.g!));
  const change = (v: string) => { setW(v); setK(0); setPlaying(false); };

  const c0 = frame[0];
  const lba = spec.kind === 'lba';
  const cellClass = (s: string) => (s === LEFT_END || s === RIGHT_END ? ' marker' : s === BLANK ? ' blank' : '');

  let tapeView: ReactNode;
  if (det) {
    const from = lba ? 0 : Math.min(0, c0.head - 6);
    const to = lba ? c0.tape.length - 1 : Math.max(c0.tape.length + 1, c0.head + 6);
    const cells = [];
    for (let i = from; i <= to; i++) {
      const s = i < 0 ? BLANK : c0.tape[i] ?? BLANK;
      cells.push(<span key={i} className={`cell${i === c0.head ? ' head' : cellClass(s)}`}>{s}</span>);
    }
    tapeView = <div className="tape center" aria-label="Tape">{cells}</div>;
  } else {
    tapeView = (
      <div className="worlds" aria-label="Branches">
        {frame.map((c, i) => (
          <div key={i} className={`world${accept.has(c.q) ? ' acc' : ''}`}>
            <b>{c.q}</b>
            <div className="mini-tape">
              {c.tape.slice(0, 14).map((s, j) => (
                <span key={j} className={j === c.head ? 'h' : ''}>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const outcomeText =
    sim.outcome === 'accept'
      ? det ? 'The machine halted in the accept state.' : 'At least one branch reached the accept state.'
      : sim.outcome === 'limit'
        ? `Still running after ${det ? MAX_STEPS : MAX_LEVELS} steps. This machine may loop forever on this input; that is exactly what makes Turing machines hard to analyse.`
        : det ? 'The machine halted without accepting: it reached the reject state or had no move.' : 'Every branch halted without accepting.';

  return (
    <Panel title={title} tag={tag} caption={caption}>
      <StateDiagram spec={spec} active={active} hot={hot} />
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
      {tapeView}
      <div className="status" aria-live="polite">
        {done ? (
          <>
            {sim.outcome === 'limit' ? <span className="verdict bad">∞ No answer yet</span> : <Verdict ok={sim.outcome === 'accept'} />} {outcomeText}
          </>
        ) : det ? (
          <>
            Step {k} · state <b>{c0.q}</b> · configuration <code className="inline-code">{tmConfigString(c0)}</code>
          </>
        ) : (
          <>
            After {k} move{k === 1 ? '' : 's'}: <b>{frame.length}</b> live branch{frame.length === 1 ? '' : 'es'}
          </>
        )}
      </div>
    </Panel>
  );
}
