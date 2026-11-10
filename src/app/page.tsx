import Link from 'next/link';
import { BgArt, PointerArrow, Scribble } from '@/components/BgArt';
import { GitHubButton } from '@/components/GitHubButton';
import { HeroPlayground } from '@/components/widgets/HeroPlayground';
import { Icon, type IconName } from '@/components/Icon';
import { getStars } from '@/lib/github';
import { roman } from '@/lib/site';

const MACHINES: { type: string; name: string; icon: IconName; text: string; tags: string[]; href: string; art: React.ReactNode }[] = [
  {
    type: 'Type 3 · Regular', name: 'Finite automata', icon: 'dfa', href: '/learn/dfa',
    text: 'A fixed handful of states and nothing else. They are fast and predictable, and they run every lexer and regex engine.',
    tags: ['DFA', 'NFA', 'Regex'],
    art: (
      <svg viewBox="0 0 160 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="26" cy="38" r="16" /><circle cx="96" cy="38" r="16" /><circle cx="96" cy="38" r="11" />
        <path d="M42 38h36M72 32l6 6-6 6" /><path d="M88 23c-4-22 20-22 16 0" /><path d="M118 38h30" strokeDasharray="2 6" />
      </svg>
    ),
  },
  {
    type: 'Type 2 · Context-free', name: 'Pushdown automata', icon: 'stack', href: '/learn/dpda',
    text: 'Add one stack and the machine can match nested structure: brackets, expressions, the syntax of programming languages.',
    tags: ['DPDA', 'NPDA', 'Parsers'],
    art: (
      <svg viewBox="0 0 160 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="20" y="46" width="56" height="14" rx="4" /><rect x="20" y="28" width="56" height="14" rx="4" /><rect x="20" y="10" width="56" height="14" rx="4" strokeDasharray="3 4" />
        <path d="M110 6v26M102 24l8 8 8-8" /><path d="M128 60h24" strokeDasharray="2 6" />
      </svg>
    ),
  },
  {
    type: 'Type 1 · Context-sensitive', name: 'Linear bounded automata', icon: 'bounded', href: '/learn/lba',
    text: 'A Turing machine fenced in to the space of its input. It can check several counts at once, as in aⁿbⁿcⁿ.',
    tags: ['LBA', 'CSG'],
    art: (
      <svg viewBox="0 0 160 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 14v42M146 14v42" strokeWidth="3" />
        <rect x="26" y="24" width="24" height="24" rx="4" /><rect x="56" y="24" width="24" height="24" rx="4" /><rect x="86" y="24" width="24" height="24" rx="4" /><rect x="116" y="24" width="18" height="24" rx="4" />
        <path d="M68 4v12M62 10l6 6 6-6" />
      </svg>
    ),
  },
  {
    type: 'Type 0 · Recursively enumerable', name: 'Turing machines', icon: 'tape', href: '/learn/dtm',
    text: 'An endless tape it can read and rewrite. It can run every algorithm, and some questions about it can never be answered.',
    tags: ['DTM', 'NTM', 'Halting'],
    art: (
      <svg viewBox="0 0 160 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M0 26h160M0 52h160" /><path d="M24 26v26M52 26v26M80 26v26M108 26v26M136 26v26" />
        <path d="M66 4v14M59 11l7 7 7-7" /><path d="M150 39h10" strokeDasharray="2 4" />
      </svg>
    ),
  },
];

export default async function Home() {
  const stars = await getStars();
  return (
    <main>
      <BgArt variant="hero" />
      <section className="hero">
        <div>
          <span className="hero-kicker glass">
            <span className="dotpill">Open source</span>
            Interactive theory of computation
          </span>
          <h1>
            What can a <em>machine</em>{' '}
            <span className="scribble">
              know?
              <Scribble />
            </span>
          </h1>
          <p className="lede">
            WhatAutomata teaches automata theory by letting you <b>run the machines</b>. Step through finite automata, pushdown automata, linear bounded automata and Turing machines. See how each one matches a class of formal languages, and why some problems no machine can solve.
          </p>
          <div className="hero-actions">
            <Link href="/learn/introduction" className="btn btn-primary btn-lg">
              Get started <Icon name="arrowRight" />
            </Link>
            <GitHubButton stars={stars} size="lg" />
          </div>
          <div className="hero-note">
            <PointerArrow />
            <span>Try the playground: pick a machine, type an input, and watch it run.</span>
          </div>
        </div>
        <HeroPlayground />
      </section>

      <section className="band" id="machines">
        <div className="band-head">
          <span className="eyebrow"><Icon name="rings" /> Four machines, four language types</span>
          <h2>More memory, more power</h2>
          <p>Each machine adds one kind of memory, and each one recognises exactly one level of the Chomsky hierarchy. You learn them in that order, each with its deterministic and nondeterministic versions.</p>
        </div>
        <div className="machine-cards">
          {MACHINES.map((m) => (
            <Link key={m.name} href={m.href} className="mcard">
              <div className="art">{m.art}</div>
              <span className="mtype">{m.type}</span>
              <h3>{m.name}</h3>
              <p>{m.text}</p>
              <div className="mem-tag">{m.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="band-head">
          <span className="eyebrow"><Icon name="sprout" /> How every chapter works</span>
          <h2>Intuition first, then the formal definition</h2>
          <p>Every machine chapter walks the same path, from a story to a proof to a machine you build yourself, so you always know where you are.</p>
        </div>
        <div className="path">
          {[
            ['Feel it', 'What problem does this machine solve? Start with a story and a picture, not a definition.'],
            ['Run it', 'Interactive diagrams: type inputs, step through executions, and watch states, stacks and tapes change.'],
            ['Formalise it', 'Each formal definition is shown in mathematical notation and explained in plain English.'],
            ['Connect it', 'Which language class does the machine recognise, and which grammar generates it?'],
            ['Break it', 'Its limits: what this machine provably cannot recognise.'],
            ['Build it', 'Exercises: design machines, predict outputs, test strings, and check your answers instantly.'],
          ].map(([h, p], i) => (
            <div key={h} className="step">
              <span className="roman">{roman(i + 1)}.</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <svg className="art" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <circle cx="100" cy="100" r="80" /><circle cx="100" cy="100" r="64" /><path d="M10 100h40M38 88l12 12-12 12" />
        </svg>
        <div>
          <h2>Start with a single state.</h2>
          <p>No prerequisites beyond curiosity. By the end you will understand lexers, parsers, CPUs and the Halting Problem from first principles.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/learn/introduction" className="btn btn-primary btn-lg">Get started <Icon name="arrowRight" /></Link>
          <Link href="/learn" className="btn btn-glass btn-lg">Browse chapters</Link>
        </div>
      </section>
    </main>
  );
}
