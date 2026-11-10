/* ==========================================================================
   Machine specs, diagram geometry and simulation engines.
   Pure TypeScript — no React — so it can be tested and reused anywhere.
   ========================================================================== */

export type Pt = [number, number];
/** [from, to, label, bend?, loopDirection?] */
export type EdgeSpec = [string, string, string, (number | null)?, (LoopDir | number)?];
export type LoopDir = 'up' | 'down' | 'left' | 'right';

export interface MachineSpec {
  kind: 'dfa' | 'nfa' | 'pda' | 'tm' | 'lba' | 'static';
  states: Record<string, Pt>;
  edges: EdgeSpec[];
  start?: string;
  accept?: string[];
  reject?: string[];
  dead?: string[];
  w?: number;
  h?: number;
  r?: number;
  startDir?: 'left' | 'up' | 'down';
}

export const BLANK = '␣';
export const LEFT_END = '⊢';
export const RIGHT_END = '⊣';
const isEps = (s: string) => s === 'ε' || s === 'eps' || s === '';
const normBlank = (s: string) => (s === '_' || s === BLANK ? BLANK : s);

/* ---------------------------------------------------------------- geometry */

export interface NodeGeom { id: string; x: number; y: number; r: number; base: string; sub: string | null; accept: boolean; dead: boolean }
export interface EdgeGeom { from: string; to: string; labels: string[]; lines: string[]; d: string; lx: number; ly: number }
export interface Layout { W: number; H: number; nodes: NodeGeom[]; edges: EdgeGeom[]; start: { x1: number; y1: number; x2: number; y2: number } | null; edgeIndex: number[] }

const DIRS: Record<LoopDir, number> = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 };

export function splitName(name: string): [string, string | null] {
  let m = /^([A-Za-z]+)(\d+)$/.exec(name);
  if (m) return [m[1], m[2]];
  m = /^([A-Za-z]+)_([A-Za-z0-9]+)$/.exec(name);
  if (m) return [m[1], m[2]];
  return [name, null];
}

function radius(name: string, base: number) {
  const [b, s] = splitName(name);
  const len = b.length + (s ? s.length * 0.68 : 0);
  return Math.max(base, len * 4.6 + 10);
}

export function layout(spec: MachineSpec): Layout {
  const W = spec.w ?? 520;
  const H = spec.h ?? 200;
  const baseR = spec.r ?? 23;
  const accept = new Set(spec.accept ?? []);
  const dead = new Set(spec.dead ?? []);
  const nodes: NodeGeom[] = Object.entries(spec.states).map(([id, [x, y]]) => {
    const [base, sub] = splitName(id);
    return { id, x, y, r: radius(id, baseR), base, sub, accept: accept.has(id), dead: dead.has(id) };
  });
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // group parallel edges
  const groups: { from: string; to: string; labels: string[]; bend: number | null; dir: LoopDir | number | null }[] = [];
  const key = new Map<string, number>();
  const edgeIndex: number[] = [];
  for (const [f, t, lab, bend, dir] of spec.edges) {
    const k = `${f}\u0001${t}`;
    let gi = key.get(k);
    if (gi === undefined) {
      gi = groups.length;
      key.set(k, gi);
      groups.push({ from: f, to: t, labels: [], bend: null, dir: null });
    }
    const g = groups[gi];
    g.labels.push(lab);
    if (bend !== undefined && bend !== null) g.bend = bend;
    if (dir !== undefined) g.dir = dir;
    edgeIndex.push(gi);
  }

  const edges: EdgeGeom[] = groups.map((g) => {
    const A = byId[g.from];
    const B = byId[g.to];
    const lines: string[] = [];
    g.labels.forEach((l) => l.split(';').forEach((p) => lines.push(p.trim().replace(/->/g, '→').replace(/_/g, BLANK))));
    const display = spec.kind === 'dfa' || spec.kind === 'nfa' ? [lines.join(',')] : lines;
    let d: string, lx: number, ly: number, ldir: Pt;
    if (!A || !B) return { from: g.from, to: g.to, labels: g.labels, lines: display, d: '', lx: 0, ly: 0 };
    if (g.from === g.to) {
      const a = typeof g.dir === 'number' ? (g.dir * Math.PI) / 180 : DIRS[(g.dir as LoopDir) ?? 'up'] ?? DIRS.up;
      const r = A.r, k = r * 3.1;
      const S: Pt = [A.x + r * Math.cos(a - 0.5), A.y + r * Math.sin(a - 0.5)];
      const E: Pt = [A.x + (r + 1) * Math.cos(a + 0.5), A.y + (r + 1) * Math.sin(a + 0.5)];
      const C1: Pt = [A.x + k * Math.cos(a - 0.62), A.y + k * Math.sin(a - 0.62)];
      const C2: Pt = [A.x + k * Math.cos(a + 0.62), A.y + k * Math.sin(a + 0.62)];
      d = `M${S[0]},${S[1]} C${C1[0]},${C1[1]} ${C2[0]},${C2[1]} ${E[0]},${E[1]}`;
      const dist = r * 2.11 + 13;
      lx = A.x + dist * Math.cos(a);
      ly = A.y + dist * Math.sin(a);
      ldir = [Math.cos(a), Math.sin(a)];
    } else {
      const dx = B.x - A.x, dy = B.y - A.y, dist = Math.hypot(dx, dy);
      const nx = -dy / dist, ny = dx / dist;
      const hasRev = key.has(`${g.to}\u0001${g.from}`);
      const bend = g.bend ?? (hasRev ? 0.22 : 0);
      const C: Pt = [(A.x + B.x) / 2 + nx * bend * dist, (A.y + B.y) / 2 + ny * bend * dist];
      const ua = [C[0] - A.x, C[1] - A.y], la = Math.hypot(ua[0], ua[1]) || 1;
      const ub = [C[0] - B.x, C[1] - B.y], lb = Math.hypot(ub[0], ub[1]) || 1;
      const S: Pt = [A.x + (ua[0] / la) * A.r, A.y + (ua[1] / la) * A.r];
      const E: Pt = [B.x + (ub[0] / lb) * (B.r + 1), B.y + (ub[1] / lb) * (B.r + 1)];
      d = `M${S[0]},${S[1]} Q${C[0]},${C[1]} ${E[0]},${E[1]}`;
      const mx = 0.25 * S[0] + 0.5 * C[0] + 0.25 * E[0];
      const my = 0.25 * S[1] + 0.5 * C[1] + 0.25 * E[1];
      const sgn = bend === 0 ? -1 : Math.sign(bend);
      ldir = [nx * sgn, ny * sgn];
      lx = mx + ldir[0] * 12;
      ly = my + ldir[1] * 12;
    }
    const n = display.length, lh = 16;
    const widest = Math.max(...display.map((s) => s.length)) * 7.8;
    const pushX = Math.abs(ldir[0]) * (widest / 2 - 4) * (n > 1 || g.from === g.to ? 1 : 0.15);
    const pushY = Math.abs(ldir[1]) * (((n - 1) * lh) / 2);
    return {
      from: g.from,
      to: g.to,
      labels: g.labels,
      lines: display,
      d,
      lx: lx + Math.sign(ldir[0]) * Math.max(0, pushX),
      ly: ly + Math.sign(ldir[1]) * pushY - ((n - 1) * lh) / 2,
    };
  });

  let start: Layout['start'] = null;
  if (spec.start && byId[spec.start]) {
    const S = byId[spec.start];
    const a = DIRS[spec.startDir ?? 'left'];
    start = {
      x1: S.x + Math.cos(a) * (S.r + 34), y1: S.y + Math.sin(a) * (S.r + 34),
      x2: S.x + Math.cos(a) * (S.r + 1), y2: S.y + Math.sin(a) * (S.r + 1),
    };
  }
  return { W, H, nodes, edges, start, edgeIndex };
}

/* ------------------------------------------------------- finite automata */

export interface FAMove { to: string; g: number }
export type FADelta = Record<string, Record<string, FAMove[]>>;

export function buildFA(spec: MachineSpec): FADelta {
  const L = layout(spec);
  const delta: FADelta = {};
  L.edges.forEach((e, g) =>
    e.labels.forEach((l) =>
      l.split(/[,;]/).map((s) => s.trim()).forEach((s) => {
        const sym = isEps(s) ? '' : s;
        ((delta[e.from] ??= {})[sym] ??= []).push({ to: e.to, g });
      }),
    ),
  );
  return delta;
}

export function faClosure(delta: FADelta, set: Set<string>, fired?: Set<number>) {
  const st = [...set];
  while (st.length) {
    const q = st.pop()!;
    for (const { to, g } of delta[q]?.[''] ?? []) {
      fired?.add(g);
      if (!set.has(to)) { set.add(to); st.push(to); }
    }
  }
  return set;
}

export function faStep(delta: FADelta, cur: Set<string>, a: string) {
  const next = new Set<string>(), fired = new Set<number>();
  cur.forEach((q) => (delta[q]?.[a] ?? []).forEach(({ to, g }) => { next.add(to); fired.add(g); }));
  faClosure(delta, next, fired);
  return { next, fired };
}

export function faAccepts(spec: MachineSpec, w: string): boolean {
  const delta = buildFA(spec);
  let cur = faClosure(delta, new Set([spec.start!]));
  for (const a of w) cur = faStep(delta, cur, a).next;
  const acc = new Set(spec.accept ?? []);
  return [...cur].some((q) => acc.has(q));
}

/* --------------------------------------------------------- pushdown automata */

export interface PDARule { from: string; to: string; g: number; read: string; pop: string; push: string }
export interface PDAConfig { q: string; i: number; st: string; g: number | null; id: number; parent: number | null }

export function buildPDA(spec: MachineSpec): PDARule[] {
  const L = layout(spec);
  const rules: PDARule[] = [];
  L.edges.forEach((e, g) =>
    e.labels.forEach((l) =>
      l.split(';').forEach((r) => {
        const m = /^\s*(.+?)\s*,\s*(.+?)\s*(?:→|->)\s*(.+?)\s*$/.exec(r);
        if (!m) return;
        rules.push({ from: e.from, to: e.to, g, read: isEps(m[1]) ? '' : m[1], pop: isEps(m[2]) ? '' : m[2], push: isEps(m[3]) ? '' : m[3] });
      }),
    ),
  );
  return rules;
}

let cfgId = 0;
const cfgKey = (c: { q: string; i: number; st: string }) => `${c.q}|${c.i}|${c.st}`;

function pdaApply(c: PDAConfig, r: PDARule, w: string): PDAConfig | null {
  if (r.from !== c.q) return null;
  if (r.read && w[c.i] !== r.read) return null;
  if (r.pop && c.st[0] !== r.pop) return null;
  return { q: r.to, i: c.i + (r.read ? 1 : 0), st: r.push + (r.pop ? c.st.slice(1) : c.st), g: r.g, id: ++cfgId, parent: c.id };
}

/** All configurations reachable by ε-moves only (input position unchanged). */
function pdaClosure(rules: PDARule[], frontier: PDAConfig[], w: string, cap: number, all: Map<number, PDAConfig>) {
  const seen = new Set(frontier.map(cfgKey));
  const out = [...frontier];
  const queue = [...frontier];
  while (queue.length && out.length < 400) {
    const c = queue.shift()!;
    for (const r of rules) {
      if (r.read) continue;
      const n = pdaApply(c, r, w);
      if (!n || n.st.length > cap) continue;
      const k = cfgKey(n);
      if (seen.has(k)) continue;
      seen.add(k); out.push(n); queue.push(n); all.set(n.id, n);
    }
  }
  return out;
}

export interface PDARun { frames: PDAConfig[][]; all: Map<number, PDAConfig>; accepted: PDAConfig | null; deterministic: boolean }

/** Frontier simulation: frames[k] = every configuration alive after reading k symbols (ε-closed). */
export function runPDA(spec: MachineSpec, w: string): PDARun {
  const rules = buildPDA(spec);
  const acc = new Set(spec.accept ?? []);
  const cap = 2 * w.length + 8;
  const all = new Map<number, PDAConfig>();
  const start: PDAConfig = { q: spec.start!, i: 0, st: '', g: null, id: ++cfgId, parent: null };
  all.set(start.id, start);
  let frontier = pdaClosure(rules, [start], w, cap, all);
  const frames = [frontier];
  for (let i = 0; i < w.length && frontier.length; i++) {
    const moved: PDAConfig[] = [];
    const seen = new Set<string>();
    for (const c of frontier)
      for (const r of rules) {
        if (!r.read) continue;
        const n = pdaApply(c, r, w);
        if (!n || n.st.length > cap) continue;
        const k = cfgKey(n);
        if (seen.has(k)) continue;
        seen.add(k); moved.push(n); all.set(n.id, n);
      }
    frontier = pdaClosure(rules, moved, w, cap, all);
    frames.push(frontier);
  }
  const accepted = frames.length === w.length + 1 ? frames[w.length].find((c) => acc.has(c.q)) ?? null : null;
  const deterministic = frames.every((f) => f.length <= 1) || isDeterministicPDA(rules);
  return { frames, all, accepted, deterministic };
}

export function isDeterministicPDA(rules: PDARule[]) {
  for (let i = 0; i < rules.length; i++)
    for (let j = i + 1; j < rules.length; j++) {
      const a = rules[i], b = rules[j];
      if (a.from !== b.from) continue;
      const readClash = !a.read || !b.read || a.read === b.read;
      const popClash = !a.pop || !b.pop || a.pop === b.pop;
      if (readClash && popClash) return false;
    }
  return true;
}

export function pdaPath(run: PDARun, end: PDAConfig): PDAConfig[] {
  const path: PDAConfig[] = [];
  for (let c: PDAConfig | undefined = end; c; c = c.parent !== null ? run.all.get(c.parent) : undefined) path.unshift(c);
  return path;
}

/* ----------------------------------------------------------- Turing machines */

export interface TMRule { to: string; write: string; move: 'L' | 'R' | 'S'; g: number }
export type TMDelta = Record<string, Record<string, TMRule[]>>;
export interface TMConfig { q: string; tape: string[]; head: number; g: number | null }

export function buildTM(spec: MachineSpec): TMDelta {
  const L = layout(spec);
  const delta: TMDelta = {};
  const add = (q: string, read: string, r: TMRule) => (((delta[q] ??= {})[read] ??= []).push(r));
  L.edges.forEach((e, g) =>
    e.labels.forEach((l) =>
      l.split(';').forEach((raw) => {
        const r = raw.trim();
        let m = /^(.+?)\s*(?:→|->)\s*(.+?)\s*,\s*([LRS])$/.exec(r);
        if (m) {
          const write = normBlank(m[2]);
          m[1].split(',').map((s) => normBlank(s.trim())).forEach((read) => add(e.from, read, { to: e.to, write, move: m![3] as 'L', g }));
          return;
        }
        m = /^(.+?)\s*(?:→|->)\s*([LRS])$/.exec(r);
        if (m) m[1].split(',').map((s) => normBlank(s.trim())).forEach((read) => add(e.from, read, { to: e.to, write: read, move: m![2] as 'L', g }));
      }),
    ),
  );
  return delta;
}

export function isDeterministicTM(delta: TMDelta) {
  return Object.values(delta).every((row) => Object.values(row).every((rs) => rs.length <= 1));
}

export function tmInitial(spec: MachineSpec, w: string): TMConfig {
  const tape = spec.kind === 'lba' ? [LEFT_END, ...w, RIGHT_END] : [...w];
  return { q: spec.start!, tape, head: spec.kind === 'lba' ? 1 : 0, g: null };
}

export function tmSuccessors(spec: MachineSpec, delta: TMDelta, c: TMConfig): TMConfig[] {
  const read = c.tape[c.head] ?? BLANK;
  return (delta[c.q]?.[read] ?? []).map((r) => {
    let tape = c.tape.slice();
    let head = c.head;
    if (head < 0) { tape = [BLANK, ...tape]; head = 0; }
    tape[head] = r.write;
    head += r.move === 'R' ? 1 : r.move === 'L' ? -1 : 0;
    if (spec.kind === 'lba') head = Math.max(0, Math.min(tape.length - 1, head));
    if (head < 0) { tape = [BLANK, ...tape]; head = 0; }
    while (head >= tape.length) tape.push(BLANK);
    return { q: r.to, tape, head, g: r.g };
  });
}

export const tmKey = (c: TMConfig) => `${c.q}|${c.head}|${c.tape.join('').replace(/␣+$/, '')}`;

export function tmConfigString(c: TMConfig) {
  const t = c.tape.map((s, i) => (i === c.head ? `[${c.q}]${s}` : s)).join('');
  return t.replace(/␣+$/, '') || `[${c.q}]${BLANK}`;
}

/** Breadth-first search over TM/LBA configurations. Returns null if undecided within the budget. */
export function tmAccepts(spec: MachineSpec, w: string, budget = 4000): boolean | null {
  const delta = buildTM(spec);
  const acc = new Set(spec.accept ?? []);
  const rej = new Set(spec.reject ?? []);
  let frontier = [tmInitial(spec, w)];
  const seen = new Set<string>();
  let work = 0;
  while (frontier.length) {
    const next: TMConfig[] = [];
    for (const c of frontier) {
      if (acc.has(c.q)) return true;
      if (rej.has(c.q)) continue;
      for (const n of tmSuccessors(spec, delta, c)) {
        const k = tmKey(n);
        if (seen.has(k)) continue;
        seen.add(k);
        next.push(n);
      }
      if (++work > budget) return null;
    }
    frontier = next;
  }
  return false;
}

export function accepts(spec: MachineSpec, w: string): boolean | null {
  if (spec.kind === 'dfa' || spec.kind === 'nfa') return faAccepts(spec, w);
  if (spec.kind === 'pda') return !!runPDA(spec, w).accepted;
  return tmAccepts(spec, w);
}
