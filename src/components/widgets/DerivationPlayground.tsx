'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Panel } from '../machines/Controls';
import { Icon } from '../Icon';
import { TreeView, type TNode } from './TreeView';

type Rule = { lhs: string; rhs: string };
const isVar = (c: string) => /[A-Z]/.test(c);

function parseRules(lines: string[]): Rule[] {
  const out: Rule[] = [];
  for (const line of lines) {
    const [l, r] = line.split(/→|->/).map((s) => s.trim());
    for (const alt of r.split('|').map((s) => s.trim())) out.push({ lhs: l.replace(/\s+/g, ''), rhs: alt === 'ε' ? '' : alt.replace(/\s+/g, '') });
  }
  return out;
}

interface Item { s: string; node: TNode | null }
interface State { form: Item[]; root: TNode | null; history: string[]; fresh: number[]; nextId: number }

const cloneTree = (n: TNode): TNode => ({ ...n, kids: n.kids.map(cloneTree) });
function cloneState(st: State): State {
  if (!st.root) return { ...st, form: st.form.map((x) => ({ ...x })), history: [...st.history] };
  const root = cloneTree(st.root);
  const map = new Map<number, TNode>();
  const walk = (n: TNode) => { map.set(n.id, n); n.kids.forEach(walk); };
  walk(root);
  return { ...st, root, form: st.form.map((x) => ({ s: x.s, node: x.node ? map.get(x.node.id)! : null })), history: [...st.history] };
}

export function DerivationPlayground({
  rules: ruleLines,
  start = 'S',
  title = 'Derive a string',
  caption,
  goal,
}: {
  rules: string[];
  start?: string;
  title?: ReactNode;
  caption?: ReactNode;
  goal?: string;
}) {
  const rules = useMemo(() => parseRules(ruleLines), [ruleLines]);
  const treeMode = rules.every((r) => r.lhs.length === 1 && isVar(r.lhs));
  const init = (): State => {
    const root: TNode | null = treeMode ? { id: 0, label: start, kids: [], terminal: false } : null;
    return { form: [{ s: start, node: root }], root, history: [start], fresh: [0], nextId: 1 };
  };
  const [stack, setStack] = useState<State[]>(() => [init()]);
  const st = stack[stack.length - 1];
  const formStr = st.form.map((x) => x.s).join('');
  const terminal = !/[A-Z]/.test(formStr);

  const findAt = (lhs: string) => {
    for (let i = 0; i + lhs.length <= st.form.length; i++) {
      let ok = true;
      for (let j = 0; j < lhs.length; j++) if (st.form[i + j].s !== lhs[j]) { ok = false; break; }
      if (ok) return i;
    }
    return -1;
  };
  // in tree mode, always rewrite the leftmost variable (a leftmost derivation)
  const leftmostVar = st.form.findIndex((x) => isVar(x.s));

  const apply = (r: Rule) => {
    const pos = treeMode ? (st.form[leftmostVar]?.s === r.lhs ? leftmostVar : -1) : findAt(r.lhs);
    if (pos < 0) return;
    const nx = cloneState(st);
    const fresh: number[] = [];
    const items: Item[] = [...r.rhs].map((c) => ({ s: c, node: null }));
    if (treeMode) {
      const parent = nx.form[pos].node!;
      if (items.length) {
        parent.kids = items.map((it) => {
          const n: TNode = { id: nx.nextId++, label: it.s, kids: [], terminal: !isVar(it.s) };
          it.node = n;
          fresh.push(n.id);
          return n;
        });
      } else {
        const n: TNode = { id: nx.nextId++, label: 'ε', kids: [], terminal: true };
        parent.kids = [n];
        fresh.push(n.id);
      }
    }
    nx.form.splice(pos, r.lhs.length, ...items);
    nx.history.push(nx.form.map((x) => x.s).join('') || 'ε');
    nx.fresh = fresh;
    setStack([...stack, nx]);
  };

  const applicable = (r: Rule) => (treeMode ? leftmostVar >= 0 && st.form[leftmostVar].s === r.lhs : findAt(r.lhs) >= 0);

  return (
    <Panel tag="Interactive" title={title} caption={caption}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline', margin: '0 4px 10px' }}>
        <span style={{ font: '700 11px var(--font-sans)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Current string</span>
        <span style={{ font: '600 24px var(--font-mono)', letterSpacing: '.04em', wordBreak: 'break-all' }}>
          {formStr === '' ? 'ε' : st.form.map((x, i) => (
            <span key={i} style={{ color: isVar(x.s) ? 'var(--clay)' : 'var(--ink)', fontWeight: isVar(x.s) ? 700 : 600 }}>{x.s}</span>
          ))}
        </span>
        {terminal && <span className="verdict ok">✓ only terminals left{goal && formStr === goal ? ' — goal reached!' : ''}</span>}
        {goal && !terminal && <span className="chip ochre">goal: {goal}</span>}
      </div>
      <div className="presets" style={{ marginTop: 0 }}>
        {rules.map((r, i) => (
          <button key={i} type="button" className="pill-btn" disabled={!applicable(r)} onClick={() => apply(r)} style={{ fontFamily: 'var(--font-mono)' }}>
            {r.lhs} → {r.rhs || 'ε'}
          </button>
        ))}
      </div>
      <div className="controls">
        <button type="button" className="pill-btn" disabled={stack.length < 2} onClick={() => setStack(stack.slice(0, -1))}><Icon name="arrowLeft" /> Undo</button>
        <button type="button" className="pill-btn" onClick={() => setStack([init()])}><Icon name="reset" /> Reset</button>
      </div>
      <div className="trace" aria-label="Derivation">{st.history.join('  ⇒  ')}</div>
      {treeMode && st.root && (
        <div style={{ marginTop: 12 }}>
          <TreeView root={st.root} fresh={new Set(st.fresh)} />
        </div>
      )}
      <p className="panel-caption" style={{ marginTop: 8 }}>
        {treeMode
          ? 'Rules always rewrite the leftmost variable (a leftmost derivation). Rules that cannot apply are greyed out.'
          : 'A rule rewrites the leftmost place where its left-hand side appears. Notice that left-hand sides can contain several symbols: the context.'}
      </p>
    </Panel>
  );
}
