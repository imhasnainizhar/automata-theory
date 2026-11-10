/* Automata A→Z — site chrome: navigation, progress, theme, math rendering */
(function () {
  'use strict';

  const CHAPTERS = [
    { part: 'I · Foundations' },
    { slug: '01-big-picture', title: 'The Big Picture', blurb: 'What “computation” means and the ladder of machines.' },
    { slug: '02-math-toolkit', title: 'The Mathematical Toolkit', blurb: 'Sets, strings, languages, proofs, countability.' },
    { part: 'II · Regular Languages' },
    { slug: '03-dfa', title: 'Deterministic Finite Automata', blurb: 'Machines with finite memory, designed by asking “what must I remember?”' },
    { slug: '04-nfa', title: 'Nondeterminism & Subset Construction', blurb: 'Guessing machines, ε-moves, and why they are no stronger.' },
    { slug: '05-regex', title: 'Regular Expressions', blurb: 'The algebra of patterns and Kleene’s theorem.' },
    { slug: '06-regular-limits', title: 'Closure, Decisions & Pumping', blurb: 'What regular languages can and cannot do.' },
    { slug: '07-minimization', title: 'Myhill–Nerode & Minimization', blurb: 'The true “state” of a language; Mealy & Moore machines.' },
    { part: 'III · Context-Free Languages' },
    { slug: '08-cfg', title: 'Context-Free Grammars', blurb: 'Recursion, parse trees, ambiguity, CNF, CYK.' },
    { slug: '09-pda', title: 'Pushdown Automata', blurb: 'Finite control plus a stack; equivalence with CFGs.' },
    { slug: '10-cfl-limits', title: 'Limits of Context-Free Languages', blurb: 'Pumping lemma for CFLs, closure and decision properties.' },
    { part: 'IV · Computability' },
    { slug: '11-turing-machines', title: 'Turing Machines', blurb: 'The model of all computation and the Church–Turing thesis.' },
    { slug: '12-decidability', title: 'Decidability & the Halting Problem', blurb: 'Diagonalization and the first unsolvable problem.' },
    { slug: '13-reductions', title: 'Reductions, Rice & PCP', blurb: 'Spreading undecidability from problem to problem.' },
    { slug: '14-chomsky-hierarchy', title: 'The Chomsky Hierarchy', blurb: 'Grammars ↔ machines, from Type 3 to Type 0.' },
    { part: 'V · Complexity' },
    { slug: '15-complexity', title: 'Complexity: P, NP & Beyond', blurb: 'Efficient computation, NP-completeness, space classes.' },
    { part: 'VI · Mastery' },
    { slug: '16-applications', title: 'Automata in the Real World', blurb: 'Lexers, regex engines, parsers, protocols, verification.' },
    { slug: '17-review', title: 'Cheat Sheet & Practice', blurb: 'One-page summary, proof strategies, mixed problems.' },
  ];
  const LESSONS = CHAPTERS.filter((c) => c.slug);
  const KEY = 'aaz-done-v1';
  const store = {
    get() { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) { return new Set(); } },
    set(s) { try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch (e) { /* storage unavailable */ } },
  };
  const page = document.body.dataset.page || 'index';
  const idx = LESSONS.findIndex((c) => c.slug === page);
  const href = (slug) => (slug === 'index' ? './' : slug + '.html');

  /* ---------- theme ---------- */
  const THEME_KEY = 'aaz-theme';
  try { const t = localStorage.getItem(THEME_KEY); if (t) document.documentElement.dataset.theme = t; } catch (e) { /* ignore */ }
  function toggleTheme() {
    const cur = document.documentElement.dataset.theme ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
  }

  const ICON = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    gh: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.3 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>',
  };
  const LOGO = `<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--accent)"/>
      <circle cx="10" cy="16" r="4.6" fill="none" stroke="var(--accent-ink)" stroke-width="2"/>
      <circle cx="23" cy="16" r="4.6" fill="none" stroke="var(--accent-ink)" stroke-width="2"/>
      <circle cx="23" cy="16" r="2.4" fill="none" stroke="var(--accent-ink)" stroke-width="1.4"/>
      <path d="M14.8 16h3.2" stroke="var(--accent-ink)" stroke-width="2"/><path d="M16.6 13.8l2.2 2.2-2.2 2.2" fill="none" stroke="var(--accent-ink)" stroke-width="1.8"/>
    </svg>`;

  function build() {
    const main = document.getElementById('content');
    const done = store.get();

    // top bar
    const top = document.createElement('header');
    top.className = 'topbar';
    top.innerHTML = `
      <button class="icon-btn" id="menu-btn" aria-label="Open chapter list">${ICON.menu}</button>
      <a class="brand" href="./">${LOGO}<span>Automata A→Z <small>· theory of computation</small></span></a>
      <span class="spacer"></span>
      <a class="icon-btn" href="https://github.com/imhasnainizhar/automata-theory" aria-label="Source on GitHub" title="Source on GitHub">${ICON.gh}</a>
      <button class="icon-btn" id="theme-btn" aria-label="Toggle dark mode" title="Toggle dark mode">${ICON.theme}</button>
      <div class="read-progress"></div>`;

    // sidebar
    const side = document.createElement('nav');
    side.className = 'sidebar';
    side.setAttribute('aria-label', 'Chapters');
    let html = `<div class="progress-card"><div class="row"><span>Your progress</span><span class="pc-num"></span></div><div class="progress-bar"><span></span></div></div>`;
    html += `<ul class="nav-list"><li><a href="./" class="${page === 'index' ? 'current' : ''}"><span class="nav-num">★</span><span>Start here</span></a></li></ul>`;
    let n = 0, open = false;
    CHAPTERS.forEach((c) => {
      if (c.part) { if (open) html += '</ul>'; html += `<div class="nav-part">${c.part}</div><ul class="nav-list">`; open = true; return; }
      n++;
      const cls = [c.slug === page ? 'current' : '', done.has(c.slug) ? 'done' : ''].join(' ');
      html += `<li><a href="${href(c.slug)}" class="${cls}" data-slug="${c.slug}"><span class="nav-num">${n}</span><span>${c.title}</span></a>`;
      if (c.slug === page) html += '<ul class="nav-toc"></ul>';
      html += '</li>';
    });
    html += '</ul>';
    side.innerHTML = html;

    const layout = document.createElement('div');
    layout.className = 'layout';
    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    main.classList.add('content');
    main.parentNode.insertBefore(layout, main);
    layout.append(side, main);
    document.body.insertBefore(top, layout);
    document.body.appendChild(scrim);

    // headings → ids + sidebar TOC
    const toc = side.querySelector('.nav-toc');
    main.querySelectorAll('.prose h2').forEach((h2) => {
      if (!h2.id) h2.id = h2.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (toc) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#${h2.id}"></a>`;
        li.firstChild.textContent = h2.textContent;
        toc.appendChild(li);
      }
    });

    // chapter footer
    if (idx >= 0) {
      const prev = idx > 0 ? LESSONS[idx - 1] : { slug: 'index', title: 'Start here' };
      const next = LESSONS[idx + 1];
      const end = document.createElement('section');
      end.className = 'chapter-end prose';
      end.innerHTML = `
        <div class="mark-done"><p class="md-text"></p><button class="btn md-btn" type="button"></button></div>
        <div class="pager">
          <a class="prev" href="${href(prev.slug)}"><small>← Previous</small><span>${prev.title}</span></a>
          ${next ? `<a class="next" href="${href(next.slug)}"><small>Next →</small><span>${next.title}</span></a>` : ''}
        </div>`;
      main.appendChild(end);
      const md = end.querySelector('.mark-done');
      const paintDone = () => {
        const d = store.get().has(page);
        md.classList.toggle('is-done', d);
        md.querySelector('.md-text').textContent = d ? '✓ You marked this chapter as understood.' : 'Worked through the exercises? Mark this chapter as understood to track your progress.';
        md.querySelector('.md-btn').textContent = d ? 'Undo' : 'Mark as understood';
        md.querySelector('.md-btn').className = 'btn md-btn' + (d ? '' : ' primary');
      };
      end.querySelector('.md-btn').onclick = () => {
        const s = store.get();
        s.has(page) ? s.delete(page) : s.add(page);
        store.set(s);
        paintDone(); paintProgress();
      };
      paintDone();
    }
    const foot = document.createElement('footer');
    foot.className = 'site-foot';
    foot.innerHTML = 'Automata A→Z · an open-source guide to the theory of computation · ' +
      '<a href="https://github.com/imhasnainizhar/automata-theory">source</a> · ' +
      '<a href="https://github.com/imhasnainizhar/automata-theory/issues/new/choose">report an error</a> · ' +
      'content <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>, code MIT';
    main.appendChild(foot);

    // home: chapter cards
    const cards = document.getElementById('chapter-cards');
    if (cards) {
      let num = 0, out = '';
      CHAPTERS.forEach((c) => {
        if (c.part) { if (out) out += '</div>'; out += `<h3>Part ${c.part}</h3><div class="grid">`; return; }
        num++;
        out += `<a class="card ${done.has(c.slug) ? 'done' : ''}" href="${href(c.slug)}"><div class="n">CHAPTER ${num}</div><h3>${c.title}</h3><p>${c.blurb}</p></a>`;
      });
      cards.innerHTML = out + '</div>';
    }

    function paintProgress() {
      const s = store.get();
      const k = LESSONS.filter((c) => s.has(c.slug)).length;
      side.querySelector('.pc-num').textContent = `${k} / ${LESSONS.length}`;
      side.querySelector('.progress-bar span').style.width = (100 * k / LESSONS.length) + '%';
      side.querySelectorAll('a[data-slug]').forEach((a) => a.classList.toggle('done', s.has(a.dataset.slug)));
    }
    paintProgress();

    // interactions
    document.getElementById('theme-btn').onclick = toggleTheme;
    document.getElementById('menu-btn').onclick = () => document.body.classList.toggle('nav-open');
    scrim.onclick = () => document.body.classList.remove('nav-open');
    side.addEventListener('click', (e) => { if (e.target.closest('a')) document.body.classList.remove('nav-open'); });
    const bar = top.querySelector('.read-progress');
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (100 * scrollY / max) : 0) + '%';
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const cur = side.querySelector('a.current');
    if (cur) side.scrollTop = Math.max(0, cur.offsetTop - side.clientHeight / 3);
    if (location.hash) { const t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) t.scrollIntoView(); }
  }

  function wrapTables() {
    document.querySelectorAll('.prose table').forEach((t) => {
      if (t.parentElement.classList.contains('table-wrap')) return;
      const w = document.createElement('div');
      w.className = 'table-wrap';
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  function math() {
    if (typeof renderMathInElement !== 'function') return;
    const toc = document.querySelector('.nav-toc');
    if (toc) renderMathInElement(toc, { delimiters: [{ left: '$', right: '$', display: false }], throwOnError: false });
    renderMathInElement(document.getElementById('content'), {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
      ],
      ignoredClasses: ['sim', 'widget', 'fa-canvas'],
      throwOnError: false,
    });
  }

  function start() {
    build();
    wrapTables();
    math();
    if (window.Automata) window.Automata.init();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
