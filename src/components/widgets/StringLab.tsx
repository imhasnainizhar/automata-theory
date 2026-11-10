'use client';

import { useMemo, useState } from 'react';
import { Panel, Segmented } from '../machines/Controls';

const words = (sigma: string[], k: number): string[] => (k === 0 ? [''] : words(sigma, k - 1).flatMap((w) => sigma.map((a) => w + a)));

function star(lang: string[], maxLen: number): string[] {
  const out = new Set<string>(['']);
  let frontier = [''];
  while (frontier.length) {
    const next: string[] = [];
    for (const w of frontier) for (const x of lang) {
      const y = w + x;
      if (y.length <= maxLen && !out.has(y) && x !== '') { out.add(y); next.push(y); }
    }
    frontier = next;
  }
  return [...out].sort((a, b) => a.length - b.length || a.localeCompare(b));
}

const show = (w: string) => (w === '' ? 'ε' : w);

export function StringLab() {
  const [tab, setTab] = useState<'sigma' | 'ops' | 'star'>('sigma');
  const [alpha, setAlpha] = useState('a,b');
  const [k, setK] = useState(2);
  const [w, setW] = useState('abba');
  const [lang, setLang] = useState('a, ab');
  const sigma = useMemo(() => Array.from(new Set(alpha.split(',').map((s) => s.trim()).filter(Boolean))).slice(0, 4), [alpha]);
  const sk = useMemo(() => words(sigma, k), [sigma, k]);
  const L = useMemo(() => Array.from(new Set(lang.split(',').map((s) => s.trim().replace(/^ε$/, '')))), [lang]);
  const Ls = useMemo(() => star(L, 6), [L]);

  return (
    <Panel tag="Interactive" title="String lab"
      actions={
        <Segmented
          label="Tool"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'sigma', label: 'Σᵏ' },
            { value: 'ops', label: 'Operations' },
            { value: 'star', label: 'Kleene star' },
          ]}
        />
      }>
      {tab === 'sigma' && (
        <>
          <div className="controls" style={{ marginTop: 0 }}>
            <div className="field"><label>Σ</label><input value={alpha} onChange={(e) => setAlpha(e.target.value)} aria-label="Alphabet, comma separated" /></div>
            <div className="field" style={{ flex: '0 1 220px' }}>
              <label>k = {k}</label>
              <input type="range" min={0} max={4} value={k} onChange={(e) => setK(+e.target.value)} aria-label="Length k" style={{ accentColor: 'var(--moss)' }} />
            </div>
          </div>
          <p className="panel-caption">
            Σ<sup>{k}</sup> has |Σ|<sup>{k}</sup> = {sigma.length}<sup>{k}</sup> = <b>{sk.length}</b> strings:
          </p>
          <div className="results">{sk.slice(0, 81).map((x) => <div key={x || 'e'} className="result">{show(x)}</div>)}</div>
        </>
      )}
      {tab === 'ops' && (
        <>
          <div className="field" style={{ marginTop: 0 }}><label>w</label><input value={w} onChange={(e) => setW(e.target.value.replace(/\s/g, '').slice(0, 12))} aria-label="String w" /></div>
          <div className="explain">
            <div className="explain-item"><b>Length |w|</b>{w.length}</div>
            <div className="explain-item"><b>Reverse wᴿ</b><code className="inline-code">{show([...w].reverse().join(''))}</code>{w === [...w].reverse().join('') && ' — a palindrome!'}</div>
            <div className="explain-item"><b>Power w²</b><code className="inline-code">{show(w + w)}</code></div>
            <div className="explain-item"><b>Prefixes</b>{Array.from({ length: w.length + 1 }, (_, i) => show(w.slice(0, i))).join(', ')}</div>
            <div className="explain-item"><b>Suffixes</b>{Array.from({ length: w.length + 1 }, (_, i) => show(w.slice(i))).join(', ')}</div>
            <div className="explain-item"><b>Concatenation w·ab</b><code className="inline-code">{w + 'ab'}</code></div>
          </div>
        </>
      )}
      {tab === 'star' && (
        <>
          <div className="field" style={{ marginTop: 0 }}><label>L</label><input value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language L, comma separated" /></div>
          <p className="panel-caption">
            L* glues together any number of strings from L. Here are all of its strings up to length 6 ({Ls.length} in total, but L* is infinite unless L ⊆ {'{ε}'}):
          </p>
          <div className="results">{Ls.slice(0, 120).map((x) => <div key={x || 'e'} className="result">{show(x)}</div>)}</div>
        </>
      )}
    </Panel>
  );
}
