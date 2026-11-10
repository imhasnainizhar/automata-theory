/* ==========================================================================
   Automata A→Z — interactive state diagrams and simulators
   --------------------------------------------------------------------------
   <figure class="fa" data-fa='{ JSON spec }'>  renders + simulates
     type   : "dfa" | "nfa" | "pda" | "tm" | "static"
     states : { "q0": [x, y], ... }
     start  : "q0"            accept : ["q1"]       reject : ["q_rej"] (tm)
     edges  : [[from, to, label, bend?, loopDir?], ...]
              FA label  "0,1"  (ε allowed)
              PDA label "a,X→Y;b,ε→b"   (read, pop → push)
              TM label  "0→x,R;y→R"     (read → write, move  |  read → move)
     w, h   : viewBox size      test : default input      startDir : "left" | "up" | "down"
   <figure class="tree" data-tree="S[a S[ε] b]">   parse tree
   <div class="regex-lab" data-regex="..." data-tests="a,b,...">
   <div class="pump-game">
   ========================================================================== */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const BASE_R = 22;
  const BLANK = '␣';
  let uid = 0;

  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, attrs, html) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') e.className = attrs[k]; else e.setAttribute(k, attrs[k]);
    }
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const DIRS = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 };
  const isEps = (s) => s === 'ε' || s === 'eps' || s === 'λ' || s === '';
  const normBlank = (s) => (s === '_' || s === '␣') ? BLANK : s;

  /* ---------- state name rendering: q0 → q₀, q_acc → q_acc ---------- */
  function splitName(name) {
    let m = /^([A-Za-z]+)(\d+)$/.exec(name);
    if (m) return [m[1], m[2]];
    m = /^([A-Za-z]+)_([A-Za-z0-9]+)$/.exec(name);
    if (m) return [m[1], m[2]];
    return [name, null];
  }
  function stateRadius(name, spec) {
    const [b, s] = splitName(name);
    const len = b.length + (s ? s.length * 0.68 : 0);
    return Math.max(spec.r || BASE_R, len * 4.4 + 9);
  }
  function drawName(g, name, x, y) {
    const t = svgEl('text', { x, y }, g);
    const [b, s] = splitName(name);
    t.appendChild(document.createTextNode(b));
    if (s) {
      const ts = svgEl('tspan', { 'font-size': '0.7em', dy: '4' }, t);
      ts.textContent = s;
    }
    return t;
  }

  /* ---------- label parsing ---------- */
  function labelLines(type, labels) {
    const lines = [];
    labels.forEach((l) => String(l).split(';').forEach((p) => lines.push(p.trim())));
    if (type === 'dfa' || type === 'nfa') return [lines.join(',')];
    return lines;
  }

  /* ---------- render an automaton diagram ---------- */
  function renderDiagram(spec, mount) {
    const id = 'fa' + (uid++);
    const W = spec.w || 520, H = spec.h || 200;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': spec.title || 'State diagram' });
    mount.appendChild(svg);
    const defs = svgEl('defs', null, svg);
    ['n', 'h'].forEach((k) => {
      const m = svgEl('marker', { id: `${id}-${k}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 9, markerHeight: 9, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse' }, defs);
      svgEl('path', { d: 'M0,0.5 L10,5 L0,9.5 z', class: k === 'h' ? 'fa-head hot' : 'fa-head' }, m);
    });
    const P = spec.states;
    const rad = {};
    Object.keys(P).forEach((q) => (rad[q] = stateRadius(q, spec)));

    // group edges by (from, to)
    const groups = [];
    const byKey = new Map();
    (spec.edges || []).forEach((e) => {
      const [f, t, lab, bend, dir] = e;
      const key = f + '\u0001' + t;
      let g = byKey.get(key);
      if (!g) { g = { from: f, to: t, labels: [], bend: null, dir: null }; byKey.set(key, g); groups.push(g); }
      g.labels.push(lab);
      if (bend !== undefined && bend !== null) g.bend = bend;
      if (dir) g.dir = dir;
    });

    const gEdges = svgEl('g', null, svg);
    const gStates = svgEl('g', null, svg);
    const gLabels = svgEl('g', null, svg);

    groups.forEach((g) => {
      const A = P[g.from], B = P[g.to];
      if (!A || !B) { console.warn('Unknown state in edge', g); return; }
      const rA = rad[g.from], rB = rad[g.to];
      const lines = labelLines(spec.type, g.labels);
      let d, lx, ly, ldir;
      if (g.from === g.to) {
        const a = typeof g.dir === 'number' ? g.dir * Math.PI / 180 : (DIRS[g.dir || 'up']);
        const s1 = a - 0.5, s2 = a + 0.5, k = rA * 3.1;
        const S = [A[0] + rA * Math.cos(s1), A[1] + rA * Math.sin(s1)];
        const E = [A[0] + (rA + 1) * Math.cos(s2), A[1] + (rA + 1) * Math.sin(s2)];
        const C1 = [A[0] + k * Math.cos(a - 0.62), A[1] + k * Math.sin(a - 0.62)];
        const C2 = [A[0] + k * Math.cos(a + 0.62), A[1] + k * Math.sin(a + 0.62)];
        d = `M${S[0]},${S[1]} C${C1[0]},${C1[1]} ${C2[0]},${C2[1]} ${E[0]},${E[1]}`;
        const dist = rA * 2.11 + 13;
        lx = A[0] + dist * Math.cos(a); ly = A[1] + dist * Math.sin(a);
        ldir = [Math.cos(a), Math.sin(a)];
      } else {
        const dx = B[0] - A[0], dy = B[1] - A[1], dist = Math.hypot(dx, dy);
        const nx = -dy / dist, ny = dx / dist;
        const hasRev = byKey.has(g.to + '\u0001' + g.from);
        const bend = g.bend !== null ? g.bend : (hasRev ? 0.22 : 0);
        const C = [(A[0] + B[0]) / 2 + nx * bend * dist, (A[1] + B[1]) / 2 + ny * bend * dist];
        const ua = [C[0] - A[0], C[1] - A[1]], la = Math.hypot(ua[0], ua[1]) || 1;
        const ub = [C[0] - B[0], C[1] - B[1]], lb = Math.hypot(ub[0], ub[1]) || 1;
        const S = [A[0] + ua[0] / la * rA, A[1] + ua[1] / la * rA];
        const E = [B[0] + ub[0] / lb * (rB + 1), B[1] + ub[1] / lb * (rB + 1)];
        d = `M${S[0]},${S[1]} Q${C[0]},${C[1]} ${E[0]},${E[1]}`;
        const mx = 0.25 * S[0] + 0.5 * C[0] + 0.25 * E[0];
        const my = 0.25 * S[1] + 0.5 * C[1] + 0.25 * E[1];
        const sgn = bend === 0 ? -1 : Math.sign(bend);
        ldir = [nx * sgn, ny * sgn];
        lx = mx + ldir[0] * 11; ly = my + ldir[1] * 11;
      }
      g.path = svgEl('path', { d, class: 'fa-edge', 'marker-end': `url(#${id}-n)` }, gEdges);
      // labels
      const lh = 16;
      const n = lines.length;
      const widest = Math.max(...lines.map((s) => s.length)) * 7.8;
      // push multi-line blocks away from the edge so they don't overlap it
      const pushX = Math.abs(ldir[0]) * (widest / 2 - 4) * (n > 1 || g.from === g.to ? 1 : 0.15);
      const pushY = Math.abs(ldir[1]) * ((n - 1) * lh / 2);
      const cx = lx + Math.sign(ldir[0]) * Math.max(0, pushX);
      const cy = ly + Math.sign(ldir[1]) * pushY;
      g.text = svgEl('text', { class: 'fa-label', x: cx, y: cy - (n - 1) * lh / 2 }, gLabels);
      lines.forEach((ln, i) => {
        const ts = svgEl('tspan', { x: cx, dy: i === 0 ? 0 : lh }, g.text);
        ts.textContent = ln.replace(/->/g, '→').replace(/_/g, BLANK);
      });
    });

    // start arrow
    if (spec.start && P[spec.start]) {
      const S = P[spec.start], r = rad[spec.start];
      const a = DIRS[spec.startDir || 'left'];
      const x2 = S[0] + Math.cos(a) * (r + 1), y2 = S[1] + Math.sin(a) * (r + 1);
      const x1 = S[0] + Math.cos(a) * (r + 34), y1 = S[1] + Math.sin(a) * (r + 34);
      svgEl('line', { x1, y1, x2, y2, class: 'fa-start', 'marker-end': `url(#${id}-n)` }, gEdges);
    }
    const accept = new Set(spec.accept || []);
    const nodes = {};
    Object.keys(P).forEach((q) => {
      const [x, y] = P[q];
      const g = svgEl('g', { class: 'fa-state' + ((spec.dead || []).includes(q) ? ' dead' : '') }, gStates);
      svgEl('circle', { cx: x, cy: y, r: rad[q] }, g);
      if (accept.has(q)) svgEl('circle', { cx: x, cy: y, r: rad[q] - 4.5 }, g);
      drawName(g, q, x, y);
      nodes[q] = g;
    });

    return {
      groups, nodes, id,
      highlight(states, edgeIdx) {
        Object.keys(nodes).forEach((q) => nodes[q].classList.toggle('on', states.has(q)));
        groups.forEach((g, i) => {
          if (!g.path) return;
          const hot = edgeIdx && edgeIdx.has(i);
          g.path.classList.toggle('hot', hot);
          g.path.setAttribute('marker-end', `url(#${id}-${hot ? 'h' : 'n'})`);
          g.text.classList.toggle('hot', hot);
        });
      },
    };
  }

  /* ---------- shared simulator chrome ---------- */
  function simChrome(fig, value, opts) {
    const box = h('div', { class: 'sim' });
    const lab = h('label', null, 'Input');
    const input = h('input', { type: 'text', value: value || '', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Input string' });
    const bReset = h('button', { class: 'btn', type: 'button', title: 'Reset' }, '↺ Reset');
    const bStep = h('button', { class: 'btn', type: 'button' }, 'Step →');
    const bRun = h('button', { class: 'btn primary', type: 'button' }, opts.runLabel || '▶ Run');
    const tape = h('div', { class: 'tape' + (opts.tm ? ' tm' : '') });
    const status = h('div', { class: 'status' });
    const trace = h('div', { class: 'trace' });
    box.append(lab, input, bReset, bStep, bRun, tape, status, trace);
    const cap = fig.querySelector('figcaption');
    fig.insertBefore(box, cap);
    return { input, bReset, bStep, bRun, tape, status, trace };
  }
  const fmtSet = (s) => (s.size ? '{' + [...s].join(', ') + '}' : '∅');

  /* ---------- DFA / NFA simulation ---------- */
  function setupFA(fig, spec, D) {
    const delta = {};
    D.groups.forEach((g, gi) => {
      g.labels.forEach((l) => String(l).split(/[,;]/).map((s) => s.trim()).forEach((s) => {
        const sym = isEps(s) ? '' : s;
        ((delta[g.from] = delta[g.from] || {})[sym] = delta[g.from][sym] || []).push({ to: g.to, gi });
      }));
    });
    const accept = new Set(spec.accept || []);
    const closure = (set, fired) => {
      const st = [...set];
      while (st.length) {
        const q = st.pop();
        ((delta[q] || {})[''] || []).forEach(({ to, gi }) => {
          fired && fired.add(gi);
          if (!set.has(to)) { set.add(to); st.push(to); }
        });
      }
      return set;
    };
    const ui = simChrome(fig, spec.test, {});
    let w = '', pos = 0, cur = new Set(), timer = null, log = [];

    function paintTape() {
      ui.tape.innerHTML = '';
      if (!w.length) { ui.tape.appendChild(h('span', { class: pos === 0 ? 'next' : 'done' }, 'ε')); return; }
      [...w].forEach((c, i) => ui.tape.appendChild(h('span', { class: i < pos ? 'done' : i === pos ? 'next' : '' }, esc(c))));
    }
    function verdict() {
      const ok = [...cur].some((q) => accept.has(q));
      const why = cur.size === 0 ? 'no transition available — the machine is stuck (implicit dead state).'
        : ok ? `ended in accepting state ${[...cur].filter((q) => accept.has(q)).join(', ')}.`
        : `ended in ${fmtSet(cur)}, ${cur.size > 1 ? 'none of which is' : 'which is not'} accepting.`;
      ui.status.innerHTML = `<span class="${ok ? 'yes' : 'no'}">${ok ? '✓ Accepted' : '✗ Rejected'}</span> — ${why}`;
    }
    function show(fired) {
      D.highlight(cur, fired);
      paintTape();
      ui.trace.textContent = log.join('\n');
      ui.trace.scrollTop = ui.trace.scrollHeight;
      if (pos >= w.length || cur.size === 0) { verdict(); ui.bStep.disabled = true; stop(); }
      else {
        ui.bStep.disabled = false;
        ui.status.innerHTML = `${spec.type === 'nfa' ? 'Active states' : 'Current state'}: <b>${spec.type === 'nfa' ? fmtSet(cur) : [...cur][0]}</b> · next symbol <code>${esc(w[pos])}</code>`;
      }
    }
    function reset() {
      stop();
      w = ui.input.value.trim();
      pos = 0;
      const fired = new Set();
      cur = closure(new Set([spec.start]), fired);
      log = [`start: ${fmtSet(cur)}`];
      show(fired);
    }
    function step() {
      if (pos >= w.length || cur.size === 0) return;
      const a = w[pos];
      const next = new Set(), fired = new Set();
      cur.forEach((q) => ((delta[q] || {})[a] || []).forEach(({ to, gi }) => { next.add(to); fired.add(gi); }));
      closure(next, fired);
      log.push(`${fmtSet(cur)} —${a}→ ${fmtSet(next)}`);
      cur = next; pos++;
      show(fired);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; ui.bRun.textContent = '▶ Run'; } }
    ui.bReset.onclick = reset;
    ui.bStep.onclick = step;
    ui.bRun.onclick = () => {
      if (timer) return stop();
      if (pos >= w.length || cur.size === 0) reset();
      ui.bRun.textContent = '❚❚ Pause';
      timer = setInterval(step, 520);
    };
    ui.input.addEventListener('input', reset);
    ui.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ui.bRun.click(); } });
    reset();
  }

  /* ---------- PDA simulation (breadth-first over configurations) ---------- */
  function setupPDA(fig, spec, D) {
    const rules = [];
    D.groups.forEach((g, gi) => g.labels.forEach((l) => String(l).split(';').forEach((r) => {
      const m = /^\s*(.+?)\s*,\s*(.+?)\s*(?:→|->)\s*(.+?)\s*$/.exec(r);
      if (!m) return;
      rules.push({ from: g.from, to: g.to, gi, read: isEps(m[1]) ? '' : m[1], pop: isEps(m[2]) ? '' : m[2], push: isEps(m[3]) ? '' : m[3] });
    })));
    const accept = new Set(spec.accept || []);
    const ui = simChrome(fig, spec.test, { runLabel: '▶ Find accepting run' });
    ui.bStep.textContent = 'Step through run →';
    let path = null, k = 0, timer = null;

    function search(w) {
      const start = { q: spec.start, i: 0, st: '', prev: null, rule: null };
      const seen = new Set();
      const queue = [start];
      const cap = 4 * w.length + 12;
      let explored = 0;
      while (queue.length && explored < 60000) {
        const c = queue.shift(); explored++;
        if (c.i === w.length && accept.has(c.q)) return { c, explored };
        for (const r of rules) {
          if (r.from !== c.q) continue;
          if (r.read && w[c.i] !== r.read) continue;
          if (r.pop && c.st[0] !== r.pop) continue;
          const st = r.push + (r.pop ? c.st.slice(1) : c.st);
          if (st.length > cap) continue;
          const i = c.i + (r.read ? 1 : 0);
          const key = r.to + '|' + i + '|' + st;
          if (seen.has(key)) continue;
          seen.add(key);
          queue.push({ q: r.to, i, st, prev: c, rule: r });
        }
      }
      return { c: null, explored };
    }
    const cfg = (c, w) => `(${c.q}, ${w.slice(c.i) || 'ε'}, ${c.st || 'ε'})`;
    function paint(w) {
      const c = path[k];
      ui.tape.innerHTML = '';
      if (!w.length) ui.tape.appendChild(h('span', { class: 'done' }, 'ε'));
      [...w].forEach((ch, i) => ui.tape.appendChild(h('span', { class: i < c.i ? 'done' : i === c.i ? 'next' : '' }, esc(ch))));
      D.highlight(new Set([c.q]), c.rule ? new Set([c.rule.gi]) : new Set());
      ui.status.innerHTML = `Step ${k}/${path.length - 1} · state <b>${c.q}</b> · stack (top first): <code>${esc(c.st || 'ε')}</code>` +
        (k === path.length - 1 ? ' · <span class="yes">✓ Accepted</span>' : '');
      ui.bStep.disabled = k >= path.length - 1;
    }
    function run() {
      stop();
      const w = ui.input.value.trim();
      const { c, explored } = search(w);
      ui.trace.textContent = '';
      if (!c) {
        path = null;
        D.highlight(new Set(), new Set());
        ui.tape.innerHTML = '';
        [...w].forEach((ch) => ui.tape.appendChild(h('span', null, esc(ch))));
        ui.status.innerHTML = `<span class="no">✗ Rejected</span> — explored ${explored} configurations, none accepts. Every nondeterministic branch dies.`;
        ui.bStep.disabled = true;
        return;
      }
      path = [];
      for (let x = c; x; x = x.prev) path.unshift(x);
      ui.trace.textContent = 'Accepting branch (state, remaining input, stack):\n' + path.map((x) => cfg(x, w)).join('\n⊢ ');
      k = 0; paint(w);
      timer = setInterval(() => { if (k < path.length - 1) { k++; paint(w); } else stop(); }, 650);
      ui.bRun.textContent = '❚❚ Pause';
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } ui.bRun.textContent = '▶ Find accepting run'; }
    ui.bRun.onclick = () => (timer ? stop() : run());
    ui.bStep.onclick = () => { stop(); if (!path) run(), stop(); else if (k < path.length - 1) { k++; paint(ui.input.value.trim()); } };
    ui.bReset.onclick = () => { stop(); path = null; ui.trace.textContent = ''; D.highlight(new Set([spec.start]), new Set()); ui.status.textContent = 'Press “Find accepting run” — the simulator explores every nondeterministic branch.'; ui.tape.innerHTML = ''; ui.bStep.disabled = false; };
    ui.input.addEventListener('input', ui.bReset.onclick);
    ui.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    ui.bReset.onclick();
  }

  /* ---------- Turing machine simulation ---------- */
  function setupTM(fig, spec, D) {
    const delta = {};
    D.groups.forEach((g, gi) => g.labels.forEach((l) => String(l).split(';').forEach((r) => {
      r = r.trim();
      let m = /^(.+?)\s*(?:→|->)\s*(.+?)\s*,\s*([LRS])$/.exec(r);
      if (m) {
        const read = normBlank(m[1]);
        (delta[g.from] = delta[g.from] || {})[read] = { to: g.to, write: normBlank(m[2]), move: m[3], gi };
        return;
      }
      m = /^(.+?)\s*(?:→|->)\s*([LRS])$/.exec(r);
      if (m) m[1].split(',').map((s) => normBlank(s.trim())).forEach((read) => {
        (delta[g.from] = delta[g.from] || {})[read] = { to: g.to, write: read, move: m[2], gi };
      });
    })));
    const accept = new Set(spec.accept || []);
    const reject = new Set(spec.reject || []);
    const ui = simChrome(fig, spec.test, { tm: true });
    let tape, head, q, steps, halted, timer = null;

    function config() {
      const keys = [...tape.keys()];
      const lo = Math.min(0, head, ...keys), hi = Math.max(head, ...keys);
      let s = '';
      for (let i = lo; i <= hi; i++) {
        if (i === head) s += ` [${q}] `;
        s += tape.get(i) || BLANK;
      }
      return s.trim();
    }
    function paint(fired) {
      ui.tape.innerHTML = '';
      for (let i = head - 7; i <= head + 7; i++) {
        ui.tape.appendChild(h('span', { class: i === head ? 'head' : '' }, esc(tape.get(i) || BLANK)));
      }
      D.highlight(new Set([q]), fired || new Set());
      let st = `Step ${steps} · state <b>${q}</b> · configuration <code>${esc(config())}</code>`;
      if (halted) st += ' · ' + (halted === 'acc' ? '<span class="yes">✓ Accepted (halted in accept state)</span>' : `<span class="no">✗ Rejected</span> (${halted === 'rej' ? 'entered reject state' : 'no transition defined — halts and rejects'})`);
      ui.status.innerHTML = st;
      ui.bStep.disabled = !!halted;
    }
    function reset() {
      stop();
      tape = new Map();
      [...ui.input.value.trim()].forEach((c, i) => tape.set(i, c));
      head = 0; q = spec.start; steps = 0; halted = accept.has(q) ? 'acc' : null;
      paint();
    }
    function step() {
      if (halted) return stop();
      const read = tape.get(head) || BLANK;
      const r = (delta[q] || {})[read];
      if (!r) { halted = 'stuck'; paint(); return stop(); }
      if (r.write === BLANK) tape.delete(head); else tape.set(head, r.write);
      head += r.move === 'R' ? 1 : r.move === 'L' ? -1 : 0;
      if (spec.leftEnd && head < 0) head = 0;
      q = r.to; steps++;
      if (accept.has(q)) halted = 'acc'; else if (reject.has(q)) halted = 'rej';
      if (steps > 5000 && !halted) { halted = 'stuck'; }
      paint(new Set([r.gi]));
      if (halted) stop();
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } ui.bRun.textContent = '▶ Run'; }
    ui.bReset.onclick = reset;
    ui.bStep.onclick = step;
    ui.bRun.onclick = () => {
      if (timer) return stop();
      if (halted) reset();
      ui.bRun.textContent = '❚❚ Pause';
      timer = setInterval(step, spec.speed || 280);
    };
    ui.input.addEventListener('input', reset);
    ui.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ui.bRun.click(); } });
    reset();
  }

  function renderFA(fig) {
    let spec;
    try { spec = JSON.parse(fig.getAttribute('data-fa')); }
    catch (e) { console.error('Bad automaton spec', e, fig); return; }
    const canvas = h('div', { class: 'fa-canvas' });
    fig.insertBefore(canvas, fig.firstChild);
    const D = renderDiagram(spec, canvas);
    if (spec.sim === false || spec.type === 'static') return;
    if (spec.type === 'dfa' || spec.type === 'nfa') setupFA(fig, spec, D);
    else if (spec.type === 'pda') setupPDA(fig, spec, D);
    else if (spec.type === 'tm') setupTM(fig, spec, D);
  }

  /* ---------- parse trees: "E[E[T] + T[F[a]]]" ---------- */
  function renderTree(fig) {
    const src = fig.getAttribute('data-tree');
    const toks = src.match(/\[|\]|[^\s\[\]]+/g) || [];
    let i = 0;
    function node() {
      const n = { label: toks[i++], kids: [] };
      if (toks[i] === '[') { i++; while (toks[i] !== ']' && i < toks.length) n.kids.push(node()); i++; }
      return n;
    }
    const root = node();
    let leafX = 0, maxDepth = 0;
    (function layout(n, d) {
      n.d = d; maxDepth = Math.max(maxDepth, d);
      if (!n.kids.length) { n.x = leafX++; return; }
      n.kids.forEach((k) => layout(k, d + 1));
      n.x = (n.kids[0].x + n.kids[n.kids.length - 1].x) / 2;
    })(root, 0);
    const gx = 54, gy = 58, pad = 26;
    const W = Math.max(1, leafX - 1) * gx + pad * 2, H = maxDepth * gy + pad * 2;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Parse tree' });
    svg.style.maxWidth = Math.min(W * 1.35, 760) + 'px';
    const ge = svgEl('g', null, svg), gn = svgEl('g', null, svg);
    const X = (n) => pad + n.x * gx, Y = (n) => pad + n.d * gy;
    (function draw(n) {
      n.kids.forEach((k) => { svgEl('line', { x1: X(n), y1: Y(n), x2: X(k), y2: Y(k), class: 'tree-edge' }, ge); draw(k); });
      const g = svgEl('g', { class: 'tree-node' + (n.kids.length ? '' : ' leaf') }, gn);
      svgEl('circle', { cx: X(n), cy: Y(n), r: 15 }, g);
      const t = svgEl('text', { x: X(n), y: Y(n) }, g);
      t.textContent = n.label;
    })(root);
    const c = h('div', { class: 'tree-canvas' });
    c.appendChild(svg);
    fig.insertBefore(c, fig.firstChild);
  }

  /* ---------- regex lab ---------- */
  function setupRegexLab(div) {
    div.classList.add('widget');
    div.innerHTML = `<h4>Regex lab</h4>
      <p>Write a regular expression in textbook notation: <code>|</code> (or <code>∪</code>) for union, juxtaposition for concatenation, <code>*</code> for star, <code>ε</code> for the empty string, parentheses for grouping. The whole string must match.</p>
      <div class="row"><input type="text" class="rx" style="flex:1 1 220px" spellcheck="false" aria-label="Regular expression"><span class="rx-err no"></span></div>
      <div class="row"><input type="text" class="tests" style="flex:1 1 320px" spellcheck="false" aria-label="Test strings"></div>
      <div class="log">Test strings are comma-separated; leave a blank entry to test ε.</div>
      <div class="regex-results"></div>`;
    const rx = div.querySelector('.rx'), tests = div.querySelector('.tests'), out = div.querySelector('.regex-results'), err = div.querySelector('.rx-err');
    rx.value = div.dataset.regex || '(a|b)*abb';
    tests.value = div.dataset.tests || 'abb,aabb,babb,ab,abba,';
    function update() {
      let src = rx.value.replace(/∪/g, '|').replace(/ε/g, '(?:)').replace(/∅/g, '(?!)').replace(/\s+/g, '');
      let re;
      try { re = new RegExp('^(?:' + src + ')$', 'u'); err.textContent = ''; }
      catch (e) { err.textContent = 'Invalid expression'; out.innerHTML = ''; return; }
      out.innerHTML = '';
      tests.value.split(',').forEach((t) => {
        t = t.trim();
        const ok = re.test(t);
        out.appendChild(h('div', { class: ok ? 'm' : 'n' }, `<span>${esc(t || 'ε')}</span><span>${ok ? '✓' : '✗'}</span>`));
      });
    }
    rx.addEventListener('input', update); tests.addEventListener('input', update);
    update();
  }

  /* ---------- pumping lemma game for {0^n 1^n} ---------- */
  function setupPumpGame(div) {
    div.classList.add('widget');
    div.innerHTML = `<h4>The pumping game — L = { 0ⁿ1ⁿ : n ≥ 0 }</h4>
      <p>You are trying to prove L is <b>not</b> regular. The adversary claims it is, and commits to a pumping length p. You pick a string s ∈ L with |s| ≥ p. The adversary splits s = xyz with |xy| ≤ p and |y| ≥ 1. You pick i. If xyⁱz ∉ L, you defeat that split. A real proof must defeat <i>every possible split</i>.</p>
      <div class="row"><b>Adversary picks p =</b> <span class="p pill" style="background:var(--accent-soft);color:var(--accent)"></span> <button class="btn newp" type="button">New p</button></div>
      <div class="row"><label for="pg-s">Your string s:</label><input id="pg-s" type="text" class="s" style="width:220px" spellcheck="false" placeholder="e.g. 000111"><button class="btn primary go" type="button">Commit to s</button></div>
      <div class="stage2" hidden>
        <div class="row"><b>Adversary splits:</b> <span class="split"></span> <button class="btn resplit" type="button">Another split</button></div>
        <div class="row"><label for="pg-i">Your i:</label><input id="pg-i" type="number" class="i" min="0" max="6" value="2" style="width:70px"><button class="btn primary pump" type="button">Pump</button></div>
        <div class="row log res"></div>
        <div class="row log all"></div>
      </div>
      <div class="row log msg"></div>`;
    const $ = (s) => div.querySelector(s);
    let p = 0, s = '', splits = [], cur = 0;
    const inL = (t) => { const m = /^(0*)(1*)$/.exec(t); return !!m && m[1].length === m[2].length; };
    function newP() { p = 2 + Math.floor(Math.random() * 5); $('.p').textContent = p; $('.stage2').hidden = true; $('.msg').textContent = ''; }
    function showSplit() {
      const [a, b] = splits[cur];
      $('.split').innerHTML = `<span class="x">${s.slice(0, a) || 'ε'}</span><span class="y">${s.slice(a, b)}</span><span class="z">${s.slice(b) || 'ε'}</span>`;
      $('.res').textContent = ''; $('.all').textContent = '';
    }
    $('.newp').onclick = newP;
    $('.go').onclick = () => {
      s = $('.s').value.trim();
      if (!/^[01]*$/.test(s)) { $('.msg').innerHTML = '<span class="no">Use only 0 and 1.</span>'; return; }
      if (!inL(s)) { $('.msg').innerHTML = '<span class="no">s must be in L (n zeros followed by n ones).</span>'; return; }
      if (s.length < p) { $('.msg').innerHTML = `<span class="no">|s| must be at least p = ${p}.</span>`; return; }
      splits = [];
      for (let a = 0; a < p; a++) for (let b = a + 1; b <= p; b++) splits.push([a, b]);
      cur = Math.floor(Math.random() * splits.length);
      $('.msg').innerHTML = `There are <b>${splits.length}</b> legal splits (x = blue, y = solid, z = purple). The adversary will pick whichever one is worst for you.`;
      $('.stage2').hidden = false;
      showSplit();
    };
    $('.resplit').onclick = () => { cur = (cur + 1 + Math.floor(Math.random() * (splits.length - 1 || 1))) % splits.length; showSplit(); };
    $('.pump').onclick = () => {
      const i = Math.max(0, Math.min(6, parseInt($('.i').value, 10) || 0));
      const [a, b] = splits[cur];
      const t = s.slice(0, a) + s.slice(a, b).repeat(i) + s.slice(b);
      const ok = !inL(t);
      $('.res').innerHTML = `xy<sup>${i}</sup>z = <code>${t || 'ε'}</code> → ${ok ? '<span class="pill yes">∉ L — you defeat this split</span>' : '<span class="pill no">∈ L — the adversary survives</span>'}`;
      const beaten = splits.filter(([a2, b2]) => !inL(s.slice(0, a2) + s.slice(a2, b2).repeat(i) + s.slice(b2))).length;
      $('.all').innerHTML = beaten === splits.length
        ? `With i = ${i} you defeat <b>all ${splits.length}</b> legal splits. That is exactly what a proof needs: for every split, some i escapes L.`
        : `With i = ${i} you defeat ${beaten} of ${splits.length} legal splits. Not a proof yet — try a different i or a smarter s (hint: put p zeros first).`;
    };
    newP();
  }

  function init() {
    document.querySelectorAll('figure.fa[data-fa]').forEach(renderFA);
    document.querySelectorAll('figure.tree[data-tree]').forEach(renderTree);
    document.querySelectorAll('.regex-lab').forEach(setupRegexLab);
    document.querySelectorAll('.pump-game').forEach(setupPumpGame);
  }
  window.Automata = { init };
})();
