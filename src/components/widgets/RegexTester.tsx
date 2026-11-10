'use client';

import { useMemo, useState } from 'react';
import { Panel } from '../machines/Controls';

/** Turn textbook notation into a JavaScript RegExp that must match the whole string. */
function compile(src: string): RegExp | null {
  const js = src.replace(/\s+/g, '').replace(/∪/g, '|').replace(/ε/g, '(?:)').replace(/∅/g, '(?!)');
  try { return new RegExp(`^(?:${js})$`, 'u'); } catch { return null; }
}

export function RegexTester({ initial = '(a|b)*abb', tests: initialTests = 'abb, aabb, babb, ab, abba, ' }: { initial?: string; tests?: string }) {
  const [rx, setRx] = useState(initial);
  const [tests, setTests] = useState(initialTests);
  const re = useMemo(() => compile(rx), [rx]);
  const list = tests.split(',').map((t) => t.trim());
  return (
    <Panel tag="Try it" title="Regex tester"
      caption="Write in textbook notation: | or ∪ for union, juxtaposition for concatenation, * for star, ε for the empty string. The whole string must match. Separate test strings with commas; an empty entry tests ε.">
      <div className="field input-bar" style={{ marginTop: 0 }}>
        <label>Regex</label>
        <input value={rx} spellCheck={false} onChange={(e) => setRx(e.target.value)} aria-label="Regular expression" />
      </div>
      {!re && <div className="status"><span className="verdict bad">That expression has a syntax error.</span></div>}
      <div className="field input-bar">
        <label>Tests</label>
        <input value={tests} spellCheck={false} onChange={(e) => setTests(e.target.value)} aria-label="Test strings, comma separated" />
      </div>
      {re && (
        <div className="results">
          {list.map((t, i) => {
            const ok = re.test(t);
            return (
              <div key={i} className={`result ${ok ? 'ok' : 'bad'}`}>
                <span>{t || 'ε'}</span>
                <span>{ok ? '✓' : '✗'}</span>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
