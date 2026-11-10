'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Panel } from '../machines/Controls';

const CLASSES = [
  {
    id: 'type0', type: 'Type 0', name: 'Recursively enumerable', color: 'rgba(133,86,106,.20)',
    grammar: 'Unrestricted: α → β, any strings (α contains a variable)',
    machines: [{ name: 'Deterministic TM', slug: 'dtm' }, { name: 'Nondeterministic TM', slug: 'ntm' }],
    example: 'Programs that halt on empty input',
    note: 'Deterministic and nondeterministic Turing machines recognise the same class.',
  },
  {
    id: 'type1', type: 'Type 1', name: 'Context-sensitive', color: 'rgba(79,127,128,.22)',
    grammar: 'Noncontracting: α → β with |α| ≤ |β|',
    machines: [{ name: 'Linear bounded automaton', slug: 'lba' }],
    example: 'aⁿbⁿcⁿ, { ww }',
    note: 'Whether deterministic LBAs are as powerful as nondeterministic ones is still an open problem.',
  },
  {
    id: 'type2', type: 'Type 2', name: 'Context-free', color: 'rgba(200,146,58,.24)',
    grammar: 'A → γ, a single variable on the left',
    machines: [{ name: 'Nondeterministic PDA', slug: 'npda' }, { name: 'Deterministic PDA (a strict subclass)', slug: 'dpda' }],
    example: 'aⁿbⁿ, balanced brackets, palindromes',
    note: 'Here nondeterminism really adds power: DPDAs recognise fewer languages than NPDAs.',
  },
  {
    id: 'type3', type: 'Type 3', name: 'Regular', color: 'rgba(86,112,63,.26)',
    grammar: 'A → aB, A → a, A → ε (right-linear)',
    machines: [{ name: 'DFA', slug: 'dfa' }, { name: 'NFA', slug: 'nfa' }],
    example: 'Binary multiples of 3, identifiers, “ends in 01”',
    note: 'DFA = NFA: guessing adds no power, though it can save exponentially many states.',
  },
];

export function ChomskyExplorer() {
  const [sel, setSel] = useState('type3');
  const c = CLASSES.find((x) => x.id === sel)!;
  const rings = [
    { id: 'type0', cx: 200, cy: 170, rx: 190, ry: 160 },
    { id: 'type1', cx: 200, cy: 196, rx: 148, ry: 126 },
    { id: 'type2', cx: 200, cy: 222, rx: 106, ry: 92 },
    { id: 'type3', cx: 200, cy: 248, rx: 64, ry: 58 },
  ];
  const labelY = [42, 98, 158, 252];
  return (
    <Panel tag="Interactive" title="The Chomsky hierarchy — tap a ring">
      <div className="hier">
        <svg viewBox="0 0 400 340" role="img" aria-label="Nested language classes">
          {rings.map((r, i) => (
            <ellipse key={r.id} {...r} className={`ring${sel === r.id ? ' sel' : ''}`} fill={CLASSES[i].color} onClick={() => setSel(r.id)} role="button" tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSel(r.id)} aria-label={`${CLASSES[i].type}: ${CLASSES[i].name}`} />
          ))}
          {CLASSES.map((x, i) => (
            <text key={x.id} x={200} y={labelY[i]} textAnchor="middle">{x.type} · {x.name}</text>
          ))}
        </svg>
        <div>
          <div className="eyebrow">{c.type}</div>
          <h3 style={{ margin: '6px 0 10px', font: '600 26px/1.1 var(--font-display)' }}>{c.name}</h3>
          <div className="explain" style={{ gridTemplateColumns: '1fr' }}>
            <div className="explain-item"><b>Grammar</b>{c.grammar}</div>
            <div className="explain-item"><b>Machines</b>
              {c.machines.map((m, i) => (
                <span key={m.slug}>{i > 0 && ' · '}<Link href={`/learn/${m.slug}`}>{m.name}</Link></span>
              ))}
            </div>
            <div className="explain-item"><b>Example</b>{c.example}</div>
            <div className="explain-item"><b>Worth knowing</b>{c.note}</div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
