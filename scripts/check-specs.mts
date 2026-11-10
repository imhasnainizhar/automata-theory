/**
 * Verifies that every machine in src/content/specs.ts accepts exactly the language
 * the course says it does, by brute force over all short strings.
 * Run with:  node scripts/check-specs.mts   (Node ≥ 22.6 strips types natively)
 */
import { accepts, layout, type MachineSpec } from '../src/lib/machines.ts';
import * as S from '../src/content/specs.ts';

const count = (w: string, c: string) => [...w].filter((x) => x === c).length;
const isPal = (w: string) => w === [...w].reverse().join('');
const all = (sigma: string[], n: number) => {
  const out = [''];
  let layer = [''];
  for (let k = 1; k <= n; k++) { layer = layer.flatMap((w) => sigma.map((a) => w + a)); out.push(...layer); }
  return out;
};

const cases: [string, MachineSpec, string[], number, (w: string) => boolean][] = [
  ['turnstile', S.turnstile, ['c', 'p'], 7, (w) => w.endsWith('c')],
  ['vending', S.vending, ['n', 'd'], 6, (w) => [...w].reduce((s, c) => s + (c === 'n' ? 5 : 10), 0) === 15],
  ['div3', S.div3, ['0', '1'], 9, (w) => (w === '' ? true : parseInt(w, 2) % 3 === 0)],
  ['ends01', S.ends01, ['0', '1'], 9, (w) => w.endsWith('01')],
  ['evenZeros', S.evenZeros, ['0', '1'], 9, (w) => count(w, '0') % 2 === 0],
  ['ends01NFA', S.ends01NFA, ['0', '1'], 9, (w) => w.endsWith('01')],
  ['thirdFromLast', S.thirdFromLast, ['0', '1'], 9, (w) => w.length >= 3 && w[w.length - 3] === '1'],
  ['twoOrThree', S.twoOrThree, ['0'], 14, (w) => w.length % 2 === 0 || w.length % 3 === 0],
  ['subsetDFA', S.subsetDFA, ['0', '1'], 9, (w) => w.endsWith('01')],
  ['dpda0n1n', S.dpda0n1n, ['0', '1'], 8, (w) => /^0*1*$/.test(w) && count(w, '0') === count(w, '1')],
  ['dpdaBrackets', S.dpdaBrackets, ['(', ')'], 8, (w) => { let d = 0; for (const c of w) { d += c === '(' ? 1 : -1; if (d < 0) return false; } return d === 0; }],
  ['dpdaWcw', S.dpdaWcw, ['a', 'b', 'c'], 7, (w) => { const i = w.indexOf('c'); return i >= 0 && count(w, 'c') === 1 && w.slice(i + 1) === [...w.slice(0, i)].reverse().join(''); }],
  ['npdaPal', S.npdaPal, ['a', 'b'], 8, (w) => w.length % 2 === 0 && isPal(w)],
  ['npdaFromGrammar', S.npdaFromGrammar, ['a', 'b'], 8, (w) => /^a*b*$/.test(w) && count(w, 'a') === count(w, 'b')],
  ['npdaOneOrTwo', S.npdaOneOrTwo, ['a', 'b'], 9, (w) => /^a*b*$/.test(w) && (count(w, 'b') === count(w, 'a') || count(w, 'b') === 2 * count(w, 'a'))],
  ['lbaAnBnCn', S.lbaAnBnCn, ['a', 'b', 'c'], 7, (w) => { const n = w.length / 3; return w === 'a'.repeat(n) + 'b'.repeat(n) + 'c'.repeat(n); }],
  ['tm0n1n', S.tm0n1n, ['0', '1'], 8, (w) => /^0*1*$/.test(w) && count(w, '0') === count(w, '1')],
  ['tmLooper', S.tmLooper, ['0', '1'], 6, (w) => /^0*$/.test(w)],
  ['ntmGuess', S.ntmGuess, ['0', '1'], 8, (w) => w.includes('11') || w.endsWith('0')],
];

let failures = 0;
for (const [name, spec, sigma, n, want] of cases) {
  // every edge must reference declared states
  for (const [f, t] of spec.edges) if (!spec.states[f] || !spec.states[t]) { console.log(`✗ ${name}: undeclared state in edge ${f}→${t}`); failures++; }
  layout(spec);
  const bad: string[] = [];
  for (const w of all(sigma, n)) {
    const got = accepts(spec, w);
    const ok = name === 'tmLooper' ? (want(w) ? got === true : got !== true) : got === want(w);
    if (!ok) bad.push(`${w || 'ε'}: got ${got}, want ${want(w)}`);
  }
  if (bad.length) { failures++; console.log(`✗ ${name}: ${bad.length} mismatches, e.g. ${bad.slice(0, 4).join(' | ')}`); }
  else console.log(`✓ ${name} (${all(sigma, n).length} strings)`);
}
process.exit(failures ? 1 : 0);
