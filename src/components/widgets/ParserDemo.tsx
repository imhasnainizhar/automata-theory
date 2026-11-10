'use client';

import { useMemo, useState } from 'react';
import { Panel } from '../machines/Controls';
import { useAutoplay } from '../machines/useAutoplay';
import { Icon } from '../Icon';
import { TreeView, type TNode } from './TreeView';

const NT = ['E', "E'", 'T', "T'", 'F'] as const;
const TERMS = ['id', '+', '*', '(', ')', '$'] as const;
type Sym = string;
const RULES: Record<string, Partial<Record<string, Sym[]>>> = {
  E: { id: ['T', "E'"], '(': ['T', "E'"] },
  "E'": { '+': ['+', 'T', "E'"], ')': [], $: [] },
  T: { id: ['F', "T'"], '(': ['F', "T'"] },
  "T'": { '*': ['*', 'F', "T'"], '+': [], ')': [], $: [] },
  F: { id: ['id'], '(': ['(', 'E', ')'] },
};
const isNT = (s: Sym) => s in RULES;

type Part = 'input' | 'look' | 'stack' | 'table' | 'tree';
interface Frame { stack: Sym[]; pos: number; tree: TNode; fresh: Set<number>; note: string; cell: [string, string] | null; focus: Part[]; done: 'ok' | 'err' | null }

function tokenize(src: string) {
  const out: { t: string; text: string }[] = [];
  const re = /\s*([A-Za-z_][A-Za-z0-9_]*|\d+|[+*()])/y;
  let m: RegExpExecArray | null;
  let i = 0;
  while (i < src.length && (re.lastIndex = i, (m = re.exec(src)))) {
    const text = m[1];
    out.push({ t: /^[+*()]$/.test(text) ? text : 'id', text });
    i = re.lastIndex;
  }
  out.push({ t: '$', text: '$' });
  return out;
}

const clone = (n: TNode): TNode => ({ ...n, kids: n.kids.map(clone) });

function parse(src: string): { frames: Frame[]; toks: { t: string; text: string }[] } {
  const toks = tokenize(src);
  let id = 0;
  const root: TNode = { id: id++, label: 'E', kids: [], terminal: false };
  const stack: { s: Sym; node: TNode | null }[] = [{ s: '$', node: null }, { s: 'E', node: root }];
  let pos = 0;
  const frames: Frame[] = [];
  const snap = (note: string, fresh: number[], cell: Frame['cell'], focus: Part[], done: Frame['done'] = null) =>
    frames.push({ stack: stack.map((x) => x.s), pos, tree: clone(root), fresh: new Set(fresh), note, cell, focus, done });
  snap('Start with the end marker $ and the start symbol E on the stack.', [root.id], null, ['stack']);
  for (let guard = 0; guard < 200; guard++) {
    const top = stack[stack.length - 1];
    const a = toks[pos];
    if (top.s === '$' && a.t === '$') { snap('Stack and input both show $, so the input is accepted.', [], null, ['stack', 'look'], 'ok'); break; }
    if (!isNT(top.s)) {
      if (top.s === a.t) {
        stack.pop();
        if (top.node) top.node.label = a.text;
        pos++;
        snap(`Match: the top of the stack “${top.s}” equals the lookahead “${a.text}”. Pop it and advance the input.`, top.node ? [top.node.id] : [], null, ['stack', 'input', 'look']);
        continue;
      }
      snap(`Error: expected “${top.s}” but saw “${a.text}”. The string is not in the language.`, [], null, ['look'], 'err');
      break;
    }
    const rhs = RULES[top.s][a.t];
    if (rhs === undefined) { snap(`Error: the table has no entry for (${top.s}, ${a.t}). The string is rejected.`, [], [top.s, a.t], ['table'], 'err'); break; }
    stack.pop();
    const kids: TNode[] = rhs.length ? rhs.map((s) => ({ id: id++, label: s, kids: [], terminal: !isNT(s) })) : [{ id: id++, label: 'ε', kids: [], terminal: true }];
    top.node!.kids = kids;
    if (rhs.length) for (let i = rhs.length - 1; i >= 0; i--) stack.push({ s: rhs[i], node: kids[i] });
    snap(`Expand: table[${top.s}, ${a.t}] says ${top.s} → ${rhs.length ? rhs.join(' ') : 'ε'}. Replace ${top.s} on the stack by the right-hand side.`, kids.map((k) => k.id), [top.s, a.t], ['table', 'stack', 'tree']);
  }
  return { frames, toks };
}

const PARTS: { id: Part; name: string; color: string; text: string }[] = [
  { id: 'input', name: 'Token input', color: 'var(--teal)', text: 'Tokens from the lexer, ending with $ (end of input).' },
  { id: 'look', name: 'Lookahead', color: 'var(--clay)', text: 'The one token the parser peeks at to decide what to do. That is the “1” in LL(1).' },
  { id: 'stack', name: 'Stack', color: 'var(--ochre)', text: 'What the parser still expects to see. This is the pushdown automaton’s memory.' },
  { id: 'table', name: 'Parsing table', color: 'var(--moss)', text: 'The finite control: given (top, lookahead), it names exactly one rule. No guessing, so it is deterministic.' },
  { id: 'tree', name: 'Parse tree', color: 'var(--plum)', text: 'The output. It records the structure, so * binds tighter than +.' },
];

export function ParserDemo({ initial = 'a + b * c' }: { initial?: string }) {
  const [src, setSrc] = useState(initial);
  const { frames, toks } = useMemo(() => parse(src), [src]);
  const [k, setK] = useState(0);
  const last = frames.length - 1;
  const [playing, setPlaying] = useAutoplay(() => {
    if (k >= last) return false;
    setK(k + 1);
    return k + 1 < last;
  }, 800);
  const f = frames[Math.min(k, last)];
  const focus = new Set(f.focus);

  return (
    <Panel tag="Interactive" title="A parser is a deterministic pushdown automaton"
      caption="A top-down LL(1) parser for arithmetic expressions. The stack holds the part of the sentence still to be matched; the table decides every move from the stack top and one token of lookahead.">
      <div className="field" style={{ marginBottom: 10 }}>
        <label>Expression</label>
        <input value={src} spellCheck={false} onChange={(e) => { setSrc(e.target.value.slice(0, 30)); setK(0); setPlaying(false); }} aria-label="Expression" />
      </div>
      <div className="presets">
        {['a + b * c', '(a + b) * c', 'x * (y + 2)', 'a + * b'].map((p) => (
          <button key={p} type="button" className="preset" onClick={() => { setSrc(p); setK(0); setPlaying(false); }}>{p}</button>
        ))}
      </div>
      <div className="tape" aria-label="Tokens">
        {toks.map((t, i) => (
          <span key={i} className={`cell${i < f.pos ? ' done' : i === f.pos ? ' head' : ''}`}>{t.text}</span>
        ))}
      </div>
      <div className="stack-wrap" style={{ alignItems: 'flex-end' }}>
        <div>
          <div className="stack">
            {f.stack.map((s, i) => <div key={`${i}-${s}`} className={`plate${s === '$' ? ' bottom' : ''}`} style={{ minWidth: 56 }}>{s}</div>)}
          </div>
          <div className="stack-label">Stack</div>
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <TreeView root={f.tree} fresh={f.fresh} maxWidth={560} />
        </div>
      </div>
      <div className="controls">
        <button type="button" className="pill-btn" onClick={() => { setK(0); setPlaying(false); }}><Icon name="reset" /> Reset</button>
        <button type="button" className="pill-btn" disabled={k >= last} onClick={() => setK(Math.min(k + 1, last))}><Icon name="step" /> Step</button>
        <button type="button" className="pill-btn primary" onClick={() => (playing ? setPlaying(false) : (k >= last && setK(0), setPlaying(true)))}>
          <Icon name={playing ? 'pause' : 'play'} /> {playing ? 'Pause' : 'Run'}
        </button>
      </div>
      <div className="status" aria-live="polite">
        {f.done && <span className={`verdict ${f.done === 'ok' ? 'ok' : 'bad'}`}>{f.done === 'ok' ? '✓ Parsed' : '✗ Syntax error'}</span>} {f.note}
      </div>
      <div className="table" style={{ marginTop: 12 }}>
        <table aria-label="LL(1) parsing table">
          <thead>
            <tr><th />{TERMS.map((t) => <th key={t} className="c">{t}</th>)}</tr>
          </thead>
          <tbody>
            {NT.map((n) => (
              <tr key={n}>
                <td><b>{n}</b></td>
                {TERMS.map((t) => {
                  const r = RULES[n][t];
                  const on = f.cell && f.cell[0] === n && f.cell[1] === t;
                  return (
                    <td key={t} className="c" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: on ? 'var(--clay-soft)' : undefined, fontWeight: on ? 700 : 400 }}>
                      {r === undefined ? '' : r.length ? r.join(' ') : 'ε'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="explain">
        {PARTS.map((p) => (
          <div key={p.id} className={`explain-item${focus.has(p.id) ? ' on' : ''}`}>
            <b><span className="dot" style={{ background: p.color }} />{p.name}</b>
            {p.text}
          </div>
        ))}
      </div>
    </Panel>
  );
}
