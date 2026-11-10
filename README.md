# WhatAutomata

[![Check](https://github.com/imhasnainizhar/automata-theory/actions/workflows/check.yml/badge.svg)](https://github.com/imhasnainizhar/automata-theory/actions/workflows/check.yml)
[![Code: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Content: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-lightgrey.svg)](LICENSE-CONTENT.md)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Learn automata theory by playing with machines.** WhatAutomata is an open-source, intuition-first course that teaches you the four classical machines (finite, pushdown, linear-bounded and Turing) by letting you run them in the browser, and connects each one to the class of formal languages it recognises.

## Course structure

| Group | Chapters |
|---|---|
| Begin | Introduction · Formal Languages & Foundations · Automata Intuition (including a CPU control-unit walkthrough) |
| Finite Automata | Deterministic (DFA) · Nondeterministic (NFA) · Regular Expressions & Kleene’s Theorem (conversions, Thompson’s construction, state elimination) |
| Pushdown Automata | Deterministic (DPDA) · Nondeterministic (NPDA) |
| Linear Bounded Automata | LBA (deterministic and nondeterministic) |
| Turing Machines | Deterministic (DTM) · Nondeterministic (NTM) |
| Synthesis | The Big Picture: hierarchy, determinism compared, decidability, complexity |

Every chapter opens with a plain-words introduction and an expandable glossary of the terms beginners find hardest. Every machine chapter then follows the same eight-part template:

1. **Intuition**: what problem does this machine solve?
2. **Visual machine**: interactive states, transitions and inputs.
3. **Execution**: trace how input moves through the machine.
4. **Formal definition**: the mathematics, plus a plain-English reading.
5. **Corresponding language**: which languages it recognises.
6. **Grammar connection**: how those languages are generated.
7. **Limitations**: what this machine cannot recognise.
8. **Exercises**: build machines and test strings.

## Interactive pieces

- DFA/NFA simulators with active-state sets, ε-closure and traces
- PDA simulator with a live stack, plus "parallel worlds" and "accepting branch" views for nondeterminism
- Turing machine and LBA simulators with tapes, end markers and branch views for NTMs
- A CPU control unit, a lexer (DFA) and an LL(1) parser (DPDA), each with its components explained
- Grammar derivation playground with live parse trees, a subset-construction stepper, a pumping-lemma game, a DFA builder with automatic checking, and prediction quizzes

## Tech

[Next.js](https://nextjs.org) (App Router) · React · TypeScript · [KaTeX](https://katex.org) for math, rendered at build time. There are no UI frameworks: the styles are a single hand-written design system in `src/app/globals.css`.

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # type-check + verify every machine against its intended language
npm run build      # production build
```

### Deploying to Vercel

Import the repository in Vercel; it detects Next.js automatically and needs no configuration. Pages are prerendered, and the GitHub star count is refreshed at most once per hour. To point the star counter and links at a different repository, edit `repo` in `src/lib/site.ts`.

## Project layout

```
src/app/                  routes: landing page, /learn index, /learn/[slug]
src/components/           chrome (nav, dock, sidebar, footer), content blocks
src/components/machines/  StateDiagram, FASim, PDASim, TMSim
src/components/widgets/   hero playground, CPU, lexer, parser, grammar playground, builders, quizzes
src/content/chapters.ts   chapter list, groups, icons and section outline
src/content/specs.ts      every machine used in the course
src/content/pages/        one file per chapter
src/lib/machines.ts       diagram geometry and simulation engines (no React)
scripts/check-specs.mts   brute-force check that each machine accepts the right language
```

## Contributing

Corrections, clearer explanations, new exercises and new machines are all welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

- **Course content** (text, exercises, diagrams): [CC BY 4.0](LICENSE-CONTENT.md)
- **Code**: [MIT](LICENSE)
