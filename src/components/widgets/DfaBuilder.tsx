'use client';

import { useMemo, useState } from 'react';
import { faAccepts, type MachineSpec } from '@/lib/machines';
import { StateDiagram } from '../machines/StateDiagram';
import { Panel } from '../machines/Controls';

const TASKS = {
  'ends-in-1': { text: 'binary strings that end in 1', alphabet: ['0', '1'], states: 2, test: (w: string) => w.endsWith('1') },
  'even-ones': { text: 'binary strings with an even number of 1s', alphabet: ['0', '1'], states: 2, test: (w: string) => [...w].filter((c) => c === '1').length % 2 === 0 },
  'no-11': { text: 'binary strings with no two consecutive 1s', alphabet: ['0', '1'], states: 3, test: (w: string) => !w.includes('11') },
  'len-mod-3': { text: 'strings over {a, b} whose length is a multiple of 3', alphabet: ['a', 'b'], states: 3, test: (w: string) => w.length % 3 === 0 },
  'contains-ab': { text: 'strings over {a, b} that contain ab', alphabet: ['a', 'b'], states: 3, test: (w: string) => w.includes('ab') },
} as const;
export type TaskId = keyof typeof TASKS;

const all = (sigma: readonly string[], n: number) => {
  const out = [''];
  let layer = [''];
  for (let k = 1; k <= n; k++) { layer = layer.flatMap((w) => sigma.map((a) => w + a)); out.push(...layer); }
  return out;
};

export function DfaBuilder({ task }: { task: TaskId }) {
  const T = TASKS[task];
  const names = Array.from({ length: T.states }, (_, i) => `q${i}`);
  const [delta, setDelta] = useState<Record<string, string>>(() => Object.fromEntries(names.flatMap((q) => T.alphabet.map((a) => [`${q}|${a}`, q]))));
  const [acc, setAcc] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);

  const spec = useMemo<MachineSpec>(() => {
    const n = names.length, cx = 260, cy = 150, R = n === 2 ? 120 : 105;
    const states = Object.fromEntries(names.map((q, i) => {
      const t = n === 2 ? (i === 0 ? Math.PI : 0) : -Math.PI + (i * 2 * Math.PI) / n;
      return [q, [cx + R * Math.cos(t), cy + R * Math.sin(t) * 0.85] as [number, number]];
    }));
    const edges: MachineSpec['edges'] = [];
    names.forEach((q) => T.alphabet.forEach((a) => {
      const to = delta[`${q}|${a}`];
      const dir = states[q][1] < cy - 5 ? 'up' : states[q][1] > cy + 5 ? 'down' : states[q][0] < cx ? 'left' : 'right';
      edges.push(to === q ? [q, q, a, null, dir] : [q, to, a]);
    }));
    return { kind: 'dfa', w: 520, h: 300, states, start: 'q0', accept: [...acc], edges, startDir: 'up' };
  }, [delta, acc, names.join(), T.alphabet]); // eslint-disable-line react-hooks/exhaustive-deps

  const tests = useMemo(() => all(T.alphabet, 5), [T.alphabet]);
  const results = checked ? tests.map((w) => ({ w, want: T.test(w), got: faAccepts(spec, w) })) : [];
  const wrong = results.filter((r) => r.want !== r.got);

  return (
    <Panel tag="Build it" title={<>Build a DFA for {T.text}</>}
      caption={`Choose where each state goes on each symbol and which states accept. “Check” runs your machine on all ${tests.length} strings of length ≤ 5.`}>
      <StateDiagram spec={spec} />
      <div className="builder-grid" style={{ ['--cols' as string]: T.alphabet.length, marginTop: 12 }}>
        <span className="h">state</span>
        {T.alphabet.map((a) => <span key={a} className="h">on {a}</span>)}
        <span className="h">accept?</span>
        {names.map((q) => (
          <div key={q} style={{ display: 'contents' }}>
            <span className="st">{q}{q === 'q0' ? ' →' : ''}</span>
            {T.alphabet.map((a) => (
              <select key={a} className="select" value={delta[`${q}|${a}`]} aria-label={`δ(${q}, ${a})`}
                onChange={(e) => { setDelta({ ...delta, [`${q}|${a}`]: e.target.value }); setChecked(false); }}>
                {names.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            ))}
            <button type="button" className={`toggle${acc.has(q) ? ' on' : ''}`} aria-pressed={acc.has(q)}
              onClick={() => { const s = new Set(acc); s.has(q) ? s.delete(q) : s.add(q); setAcc(s); setChecked(false); }}>
              {acc.has(q) ? 'accept' : 'reject'}
            </button>
          </div>
        ))}
      </div>
      <div className="controls">
        <button type="button" className="pill-btn primary" onClick={() => setChecked(true)}>Check my machine</button>
        {checked && (wrong.length === 0
          ? <span className="verdict ok">✓ Correct on all {tests.length} strings</span>
          : <span className="verdict bad">✗ {wrong.length} wrong — see below</span>)}
      </div>
      {checked && wrong.length > 0 && (
        <div className="results">
          {wrong.slice(0, 12).map((r) => (
            <div key={r.w} className="result bad" title={r.want ? 'should accept' : 'should reject'}>
              <span>{r.w || 'ε'}</span><span>{r.want ? 'should ✓' : 'should ✗'}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
