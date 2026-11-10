# Contributing to WhatAutomata

Thanks for helping make this course better! Contributions of every size are welcome. A typo fix is as valuable as a new chapter.

## Ways to contribute

- **Report an error.** Wrong proof, buggy machine, confusing explanation? [Open an issue](https://github.com/imhasnainizhar/automata-theory/issues/new/choose) and name the chapter and section.
- **Improve an explanation.** Better intuition, a clearer example, a missing pitfall.
- **Add exercises.** More problems with worked solutions, more builder tasks, more prediction quizzes.
- **Add an interactive machine.** Machines are plain data. See below.

## Running locally

```bash
git clone https://github.com/imhasnainizhar/automata-theory.git
cd automata-theory
npm install
npm run dev        # http://localhost:3000
```

Before opening a pull request:

```bash
npm run check      # TypeScript + brute-force check of every machine in src/content/specs.ts
npm run build
```

`scripts/check-specs.mts` runs each machine on every short string and compares the result with a plain-JavaScript description of the language it is supposed to recognise. When you add a machine, add a line there too.

## Where things live

| Path | What |
|---|---|
| `src/content/chapters.ts` | chapter order, groups, sidebar icons and section outline |
| `src/content/pages/*.tsx` | chapter content, one file per chapter |
| `src/content/specs.ts` | every machine used in the course |
| `src/lib/machines.ts` | diagram layout and the DFA/NFA/PDA/TM/LBA engines (pure TypeScript) |
| `src/components/machines/` | `StateDiagram`, `FASim`, `PDASim`, `TMSim` |
| `src/components/widgets/` | CPU, lexer, parser, grammar playground, builders, quizzes |
| `src/app/globals.css` | the whole design system |

## Writing style

- **Intuition before formalism.** Open each idea with a `<Note kind="intuition">`.
- Machine chapters keep the eight-part template: Intuition, Visual machine, Execution, Formal definition, Corresponding language, Grammar connection, Limitations, Exercises.
- After every formal definition, add a plain-English reading.
- Math uses KaTeX: `<M t="\delta : Q \to Q" />` (inline) and `<MB t="..." />` (display). JSX attribute strings keep backslashes as they are.
- Notation follows Sipser’s *Introduction to the Theory of Computation* where possible.

## Machine specs

```ts
export const evenZeros: MachineSpec = {
  kind: 'dfa',                       // dfa | nfa | pda | tm | lba | static
  w: 520, h: 200,                    // SVG viewBox
  start: 'Even', accept: ['Even'],
  states: { Even: [150, 112], Odd: [370, 112] },
  edges: [
    ['Even', 'Odd', '0'], ['Odd', 'Even', '0'],
    ['Even', 'Even', '1', null, 'up'],   // [from, to, label, bend?, loopDirection?]
    ['Odd', 'Odd', '1', null, 'up'],
  ],
};
```

Labels: FA `0,1` (ε allowed) · PDA `a,X→Y` (read, pop → push) · TM/LBA `a→b,R` or `a,b→R`. Separate several rules on one arrow with `;`. State names like `q0` render as q₀ and `q_acc` as q<sub>acc</sub>.

## Pull requests

1. Fork and branch (`fix/nfa-typo`, `content/more-pda-exercises`, …).
2. Keep each PR focused on one change.
3. Run `npm run check` and `npm run build`, and preview your pages on desktop and at phone width.
4. Explain *what* changed and *why*.

By contributing you agree that your contributions are licensed under the project’s licenses: MIT for code and CC BY 4.0 for course content. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).
