'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { pdaPath, runPDA, type MachineSpec, type PDAConfig } from '@/lib/machines';
import { StateDiagram } from './StateDiagram';
import { Panel, SimControls, Verdict } from './Controls';
import { useAutoplay } from './useAutoplay';

function BigStack({ st }: { st: string }) {
  const items = [...st].reverse(); // bottom first
  return (
    <div>
      <div className="stack" aria-label={`Stack, top first: ${st || 'empty'}`}>
        {items.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center' }}>empty</div>}
        {items.map((s, i) => (
          <div key={`${i}-${s}`} className={`plate${s === '⊥' ? ' bottom' : ''}`}>{s}</div>
        ))}
      </div>
      <div className="stack-label">Stack</div>
    </div>
  );
}

export function PDASim({
  spec,
  initial = '',
  presets,
  title,
  tag,
  caption,
  autoplay = false,
  view,
}: {
  spec: MachineSpec;
  initial?: string;
  presets?: string[];
  title?: ReactNode;
  tag?: string;
  caption?: ReactNode;
  autoplay?: boolean;
  view?: 'worlds' | 'branch';
}) {
  const [w, setW] = useState(initial);
  const run = useMemo(() => runPDA(spec, w), [spec, w]);
  const [mode, setMode] = useState<'worlds' | 'branch'>(view ?? (run.deterministic ? 'branch' : 'worlds'));
  const [k, setK] = useState(0);

  const path = useMemo<PDAConfig[]>(() => {
    if (run.accepted) return pdaPath(run, run.accepted);
    const lastFrame = [...run.frames].reverse().find((f) => f.length);
    return lastFrame ? pdaPath(run, lastFrame[lastFrame.length - 1]) : [];
  }, [run]);

  const steps = mode === 'branch' ? path.length : run.frames.length;
  const last = Math.max(0, steps - 1);
  const done = k >= last;

  const [playing, setPlaying] = useAutoplay(() => {
    if (k >= last) return false;
    setK(k + 1);
    return k + 1 < last;
  }, mode === 'branch' ? 620 : 800);

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => setPlaying(true), 700);
    return () => clearTimeout(t);
  }, [autoplay, setPlaying]);

  const change = (v: string) => { setW(v); setK(0); setPlaying(false); };
  const accepted = !!run.accepted;

  let active = new Set<string>(), hot = new Set<number>(), body: ReactNode = null, pos = 0, status: ReactNode;
  if (mode === 'branch') {
    const c = path[Math.min(k, path.length - 1)];
    if (c) {
      active = new Set([c.q]);
      if (c.g !== null) hot = new Set([c.g]);
      pos = c.i;
      body = (
        <div className="stack-wrap">
          <BigStack st={c.st} />
          <div style={{ flex: 1, minWidth: 200, fontSize: 14, color: 'var(--ink-2)', alignSelf: 'flex-end' }}>
            <div>Configuration</div>
            <code className="inline-code">({c.q}, {w.slice(c.i) || 'ε'}, {c.st || 'ε'})</code>
            <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 13 }}>state, input still to read, stack (top first)</div>
          </div>
        </div>
      );
    }
    status = done ? (
      <>
        <Verdict ok={accepted} />{' '}
        {accepted
          ? run.deterministic
            ? 'The only possible run read all the input and reached an accepting state.'
            : 'Shown: the branch that guessed correctly.'
          : run.deterministic
            ? 'The machine got stuck or finished outside an accepting state.'
            : 'Every branch died. Here is the one that got furthest.'}
      </>
    ) : (
      <>Move {k} of {last} · state <b>{path[k]?.q}</b></>
    );
  } else {
    const frame = run.frames[Math.min(k, run.frames.length - 1)] ?? [];
    frame.forEach((c) => { active.add(c.q); if (c.g !== null) hot.add(c.g); });
    pos = Math.min(k, w.length);
    const acc = new Set(spec.accept ?? []);
    body = (
      <div className="worlds" aria-label="Live configurations">
        {frame.length === 0 && <div className="world">all branches died</div>}
        {frame.slice(0, 24).map((c) => (
          <div key={c.id} className={`world${acc.has(c.q) && c.i === w.length ? ' acc' : ''}`}>
            <b>{c.q}</b>
            <div className="mini-stack" title="stack, top first">
              {c.st ? [...c.st].map((s, i) => <span key={i}>{s}</span>) : <span style={{ background: 'none', color: 'var(--muted)' }}>ε</span>}
            </div>
          </div>
        ))}
        {frame.length > 24 && <div className="world">+{frame.length - 24} more</div>}
      </div>
    );
    status = done ? (
      <>
        <Verdict ok={accepted} />{' '}
        {accepted ? 'At least one world ends in an accepting state.' : run.frames.length <= w.length ? 'Every world died before the input ended.' : 'No world ends in an accepting state.'}
      </>
    ) : (
      <>After reading {k} symbol{k === 1 ? '' : 's'}: <b>{frame.length}</b> live configuration{frame.length === 1 ? '' : 's'}</>
    );
  }

  return (
    <Panel
      title={title}
      tag={tag}
      caption={caption}
      actions={
        !run.deterministic || view ? (
          <div className="tabs" role="tablist">
            <button type="button" className={`tab${mode === 'worlds' ? ' on' : ''}`} onClick={() => { setMode('worlds'); setK(0); setPlaying(false); }}>Parallel worlds</button>
            <button type="button" className={`tab${mode === 'branch' ? ' on' : ''}`} onClick={() => { setMode('branch'); setK(0); setPlaying(false); }}>{accepted ? 'Accepting branch' : 'Longest branch'}</button>
          </div>
        ) : undefined
      }
    >
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
      <div className="tape">
        {w.length === 0 && <span className="cell next">ε</span>}
        {[...w].map((c, i) => (
          <span key={i} className={`cell${i < pos ? ' done' : i === pos ? ' next' : ''}`}>{c}</span>
        ))}
      </div>
      {body}
      <div className="status" aria-live="polite">{status}</div>
    </Panel>
  );
}
