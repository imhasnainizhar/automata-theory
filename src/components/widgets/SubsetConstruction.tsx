'use client';

import { useMemo } from 'react';
import { buildFA, faClosure, faStep, type MachineSpec } from '@/lib/machines';
import { StateDiagram } from '../machines/StateDiagram';
import { Panel, Transport } from '../machines/Controls';
import { useStepper } from '../machines/useAutoplay';

const name = (s: Set<string>) => (s.size ? `{${[...s].sort().join(',')}}` : '∅');

export function SubsetConstruction({ spec, alphabet }: { spec: MachineSpec; alphabet: string[] }) {
  const rows = useMemo(() => {
    const delta = buildFA(spec);
    const acc = new Set(spec.accept ?? []);
    const start = faClosure(delta, new Set([spec.start!]));
    const queue = [start];
    const seen = new Map([[name(start), start]]);
    const out: { from: Set<string>; to: Set<string>[]; accepting: boolean }[] = [];
    while (queue.length) {
      const S = queue.shift()!;
      const to = alphabet.map((a) => faStep(delta, S, a).next);
      to.forEach((T) => { if (!seen.has(name(T))) { seen.set(name(T), T); queue.push(T); } });
      out.push({ from: S, to, accepting: [...S].some((q) => acc.has(q)) });
    }
    return out;
  }, [spec, alphabet]);
  const st = useStepper(rows.length - 1, 1100);
  const k = Math.min(st.k, rows.length - 1);
  const cur = rows[k];

  return (
    <Panel tag="Step through" title="The subset construction, one row at a time"
      caption="Each DFA state is the set of NFA states the machine could be in. Start from the ε-closure of the start state; for each new set, work out where every symbol leads. Only reachable sets are ever created.">
      <StateDiagram spec={spec} active={cur.from} />
      <div className="table" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>DFA state</th>{alphabet.map((a) => <th key={a} className="c">on {a}</th>)}<th className="c">accepting?</th></tr></thead>
          <tbody>
            {rows.slice(0, k + 1).map((r, i) => (
              <tr key={i} style={i === k ? { background: 'var(--ochre-soft)' } : undefined}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{i === 0 ? '→ ' : ''}{name(r.from)}</td>
                {r.to.map((t, j) => <td key={j} className="c" style={{ fontFamily: 'var(--font-mono)' }}>{name(t)}</td>)}
                <td className={`c ${r.accepting ? 'yes' : ''}`}>{r.accepting ? 'yes' : 'no'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Transport s={st} stepWord="row" />
      <div className="status">{k >= rows.length - 1 ? `Done: ${rows.length} reachable DFA states.` : `Highlighted: the NFA states in ${name(cur.from)}.`}</div>
    </Panel>
  );
}
