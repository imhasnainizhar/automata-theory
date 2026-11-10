'use client';

import { useMemo, useState } from 'react';
import { Panel } from '../machines/Controls';

const inL = (t: string) => {
  const m = /^(0*)(1*)$/.exec(t);
  return !!m && m[1].length === m[2].length;
};

export function PumpGame() {
  const [p, setP] = useState(4);
  const [s, setS] = useState('');
  const [committed, setCommitted] = useState<string | null>(null);
  const [split, setSplit] = useState(0);
  const [i, setI] = useState(2);
  const [err, setErr] = useState('');

  const splits = useMemo(() => {
    if (!committed) return [] as [number, number][];
    const out: [number, number][] = [];
    for (let a = 0; a < p; a++) for (let b = a + 1; b <= p; b++) out.push([a, b]);
    return out;
  }, [committed, p]);

  const commit = () => {
    if (!/^[01]*$/.test(s)) return setErr('Use only 0 and 1.');
    if (!inL(s)) return setErr('s must be in L: some 0s followed by the same number of 1s.');
    if (s.length < p) return setErr(`|s| must be at least p = ${p}.`);
    setErr('');
    setCommitted(s);
    setSplit(Math.floor(Math.random() * ((p * (p + 1)) / 2)));
  };

  const [a, b] = splits[split % Math.max(1, splits.length)] ?? [0, 1];
  const c = committed ?? '';
  const pumped = c.slice(0, a) + c.slice(a, b).repeat(i) + c.slice(b);
  const beaten = splits.filter(([x, y]) => !inL(c.slice(0, x) + c.slice(x, y).repeat(i) + c.slice(y))).length;

  return (
    <Panel tag="Game" title="Beat the pumping lemma for L = { 0ⁿ1ⁿ }"
      caption="You are proving L is not regular. The adversary picks p and the split; you pick s and i. A real proof must defeat every legal split.">
      <div className="controls" style={{ marginTop: 0 }}>
        <span className="chip clay">Adversary picks p = {p}</span>
        <button type="button" className="pill-btn" onClick={() => { setP(2 + Math.floor(Math.random() * 5)); setCommitted(null); }}>New p</button>
      </div>
      <div className="controls">
        <div className="field"><label>Your s</label><input value={s} placeholder={`e.g. ${'0'.repeat(p)}${'1'.repeat(p)}`} onChange={(e) => setS(e.target.value.trim())} aria-label="Your string s" /></div>
        <button type="button" className="pill-btn primary" onClick={commit}>Commit to s</button>
      </div>
      {err && <div className="status"><span className="verdict bad">{err}</span></div>}
      {committed && (
        <>
          <div className="status">
            The adversary splits s = xyz (|xy| ≤ {p}, |y| ≥ 1). There are <b>{splits.length}</b> legal splits:
          </div>
          <div className="src" style={{ marginTop: 8 }}>
            {[...c].map((ch, j) => (
              <span key={j} style={{ background: j < a ? 'var(--teal-soft)' : j < b ? 'var(--clay)' : 'var(--plum-soft)', color: j >= a && j < b ? '#fff' : undefined }}>{ch}</span>
            ))}
          </div>
          <div className="controls">
            <button type="button" className="pill-btn" onClick={() => setSplit((x) => x + 1 + Math.floor(Math.random() * 3))}>Another split</button>
            <div className="field" style={{ flex: '0 1 180px' }}><label>Your i</label>
              <input type="number" min={0} max={5} value={i} onChange={(e) => setI(Math.max(0, Math.min(5, +e.target.value || 0)))} aria-label="Pump count i" />
            </div>
          </div>
          <div className="status">
            xy<sup>{i}</sup>z = <code className="inline-code">{pumped || 'ε'}</code>{' '}
            {inL(pumped) ? <span className="verdict bad">∈ L — the adversary survives</span> : <span className="verdict ok">∉ L — you beat this split</span>}
          </div>
          <div className="status">
            With i = {i} you beat <b>{beaten} of {splits.length}</b> splits.{' '}
            {beaten === splits.length ? 'That is a complete proof for this p: every split fails.' : 'Not a proof yet. Try another i, or put all of p’s zeros up front.'}
          </div>
        </>
      )}
    </Panel>
  );
}
