'use client';

import { useMemo, useState } from 'react';
import { StateDiagram } from '../machines/StateDiagram';
import { Panel } from '../machines/Controls';
import { useAutoplay } from '../machines/useAutoplay';
import { Icon } from '../Icon';
import { lexerDFA } from '@/content/specs';

type Kind = 'ID' | 'NUM' | 'OP' | 'PUNC' | 'KW';
type Tok = { kind: Kind; text: string };
type Part = 'src' | 'dfa' | 'lexeme' | 'longest' | 'tokens' | 'kw';
interface Step { cursor: number; start: number | null; state: string; edge: number | null; tokens: Tok[]; note: string; focus: Part[] }

const KEYWORDS = new Set(['let', 'if', 'while', 'return', 'print']);
const isLetter = (c: string) => /[A-Za-z_]/.test(c);
const isDigit = (c: string) => /[0-9]/.test(c);
const isOp = (c: string) => /[+\-*/=<>]/.test(c);
const isPunc = (c: string) => /[();{}]/.test(c);
// edge indices in lexerDFA: 0 S→ID, 1 ID↺, 2 S→NUM, 3 NUM↺, 4 S→OP, 5 S→PUNC, 6 S↺

function lex(src: string): Step[] {
  const steps: Step[] = [];
  const tokens: Tok[] = [];
  let i = 0;
  steps.push({ cursor: 0, start: null, state: 'S', edge: null, tokens: [], note: 'The scanner sits in its start state, looking at the first character.', focus: ['src', 'dfa'] });
  while (i < src.length) {
    const c = src[i];
    if (c === ' ') {
      steps.push({ cursor: i, start: null, state: 'S', edge: 6, tokens: [...tokens], note: 'A space separates tokens. The scanner skips it and stays in S.', focus: ['src'] });
      i++;
      continue;
    }
    let kind: Kind, state: string, edge: number;
    if (isLetter(c)) { kind = 'ID'; state = 'ID'; edge = 0; }
    else if (isDigit(c)) { kind = 'NUM'; state = 'NUM'; edge = 2; }
    else if (isOp(c)) { kind = 'OP'; state = 'OP'; edge = 4; }
    else if (isPunc(c)) { kind = 'PUNC'; state = 'PUNC'; edge = 5; }
    else {
      steps.push({ cursor: i, start: null, state: 'S', edge: null, tokens: [...tokens], note: `“${c}” matches no token rule. A real lexer would report an error here; we skip it.`, focus: ['dfa'] });
      i++;
      continue;
    }
    const start = i;
    steps.push({ cursor: i, start, state, edge, tokens: [...tokens], note: `“${c}” moves S → ${state}. A new lexeme begins.`, focus: ['dfa', 'lexeme'] });
    if (kind === 'ID' || kind === 'NUM') {
      const cont = kind === 'ID' ? (x: string) => isLetter(x) || isDigit(x) : isDigit;
      while (i + 1 < src.length && cont(src[i + 1])) {
        i++;
        steps.push({ cursor: i, start, state, edge: kind === 'ID' ? 1 : 3, tokens: [...tokens], note: `“${src[i]}” keeps the DFA in ${state}. The lexeme grows to “${src.slice(start, i + 1)}”.`, focus: ['dfa', 'lexeme'] });
      }
    }
    const text = src.slice(start, i + 1);
    if (kind === 'ID' && KEYWORDS.has(text)) kind = 'KW';
    tokens.push({ kind, text });
    const nxt = src[i + 1];
    steps.push({
      cursor: i + 1, start: null, state: 'S', edge: null, tokens: [...tokens],
      note: `${nxt === undefined ? 'End of input' : `“${nxt === ' ' ? 'space' : nxt}” cannot extend it`}, so take the longest match and emit ⟨${kind}, ${text}⟩.${kind === 'KW' ? ' It is in the keyword table, so it becomes KW, not ID.' : ''}`,
      focus: kind === 'KW' ? ['longest', 'tokens', 'kw'] : ['longest', 'tokens'],
    });
    i++;
  }
  steps.push({ cursor: src.length, start: null, state: 'S', edge: null, tokens: [...tokens], note: `Done: ${tokens.length} tokens, ready for the parser.`, focus: ['tokens'] });
  return steps;
}

const PARTS: { id: Part; name: string; color: string; text: string }[] = [
  { id: 'src', name: 'Source buffer', color: 'var(--teal)', text: 'The raw characters of the program, read one at a time from left to right.' },
  { id: 'dfa', name: 'Scanner DFA', color: 'var(--moss)', text: 'One finite automaton built from the regular expressions for every token type.' },
  { id: 'lexeme', name: 'Lexeme', color: 'var(--ochre)', text: 'The characters matched so far for the current token.' },
  { id: 'longest', name: 'Longest match', color: 'var(--clay)', text: 'Keep going while the DFA can; emit when the next character would leave the accepting state.' },
  { id: 'kw', name: 'Keyword table', color: 'var(--plum)', text: 'Identifiers like “let” or “if” are looked up and reclassified as keywords.' },
  { id: 'tokens', name: 'Token stream', color: 'var(--ink-2)', text: 'The output: (type, text) pairs. The parser never sees individual characters.' },
];

export function LexerDemo({ initial = 'let total = price * 12 + tax1;' }: { initial?: string }) {
  const [src, setSrc] = useState(initial);
  const steps = useMemo(() => lex(src), [src]);
  const [k, setK] = useState(0);
  const last = steps.length - 1;
  const [playing, setPlaying] = useAutoplay(() => {
    if (k >= last) return false;
    setK(k + 1);
    return k + 1 < last;
  }, 650);
  const s = steps[Math.min(k, last)];
  const focus = new Set(s.focus);

  return (
    <Panel tag="Interactive" title="A lexer is a DFA that splits code into tokens"
      caption="Lexers are the first stage of every compiler. Because each token type is a regular language, a single DFA can recognise all of them.">
      <div className="field" style={{ marginBottom: 10 }}>
        <label>Code</label>
        <input value={src} spellCheck={false} onChange={(e) => { setSrc(e.target.value.slice(0, 48)); setK(0); setPlaying(false); }} aria-label="Source code" />
      </div>
      <div className="src" aria-label="Source characters">
        {[...src].map((c, i) => {
          const cls = i === s.cursor ? 'cursor' : s.start !== null && i >= s.start && i < s.cursor ? 'lexeme' : i < s.cursor ? 'consumed' : '';
          return <span key={i} className={cls}>{c === ' ' ? '·' : c}</span>;
        })}
      </div>
      <div style={{ marginTop: 12 }}>
        <StateDiagram spec={lexerDFA} active={new Set([s.state])} hot={s.edge !== null ? new Set([s.edge]) : new Set()} label="Scanner DFA" />
      </div>
      <div className="controls">
        <button type="button" className="pill-btn" onClick={() => { setK(0); setPlaying(false); }}><Icon name="reset" /> Reset</button>
        <button type="button" className="pill-btn" disabled={k >= last} onClick={() => setK(Math.min(k + 1, last))}><Icon name="step" /> Next character</button>
        <button type="button" className="pill-btn primary" onClick={() => (playing ? setPlaying(false) : (k >= last && setK(0), setPlaying(true)))}>
          <Icon name={playing ? 'pause' : 'play'} /> {playing ? 'Pause' : 'Run'}
        </button>
      </div>
      <div className="status" aria-live="polite">{s.note}</div>
      <div className="tokens" aria-label="Tokens">
        {s.tokens.map((t, i) => (
          <span key={i} className={`token ${t.kind}`}><b>{t.text}</b><small>{t.kind}</small></span>
        ))}
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
