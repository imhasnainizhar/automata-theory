# Automata, A to Z

An intuition-first course on **automata theory, formal languages, computability and complexity** — from "what is a string?" to the Halting Problem and P vs NP.

**Read it online:** https://imhasnainizhar.github.io/automata-theory/

## What's inside

| Part | Chapters |
|---|---|
| I · Foundations | The big picture · The mathematical toolkit (sets, strings, languages, proofs, countability) |
| II · Regular languages | DFAs · NFAs & subset construction · Regular expressions & Kleene's theorem · Closure, decision properties & the pumping lemma · Myhill–Nerode, minimization, Mealy/Moore machines |
| III · Context-free languages | CFGs, parse trees, ambiguity, CNF, CYK · Pushdown automata · CFL pumping lemma & closure |
| IV · Computability | Turing machines & Church–Turing thesis · Decidability & the Halting Problem · Reductions, Rice's theorem, PCP · The Chomsky hierarchy |
| V · Complexity | P, NP, NP-completeness, Cook–Levin, coNP, PSPACE, L/NL |
| VI · Mastery | Real-world applications · Cheat sheet & mixed practice problems |

Every chapter has **Intuition** boxes, precise **definitions**, **theorems with proofs**, common **pitfalls**, **exercises with hidden solutions**, and **takeaways**.

## Interactive features

- Runnable **DFA / NFA** diagrams — step through an input and watch the active state set.
- A **nondeterministic PDA** simulator that searches all branches and replays the accepting run with its stack.
- **Turing machine** simulators with a live tape and configuration display.
- A **regex lab**, a **pumping-lemma game**, and auto-drawn **parse trees**.
- Progress tracking (stored locally in your browser) and light/dark themes.

## Running locally

It's a static site with no build step:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Authoring diagrams

State diagrams are declared in HTML and rendered by `assets/automata.js`:

```html
<figure class="fa" data-fa='{"type":"dfa","states":{"q0":[100,100],"q1":[300,100]},
  "start":"q0","accept":["q1"],"edges":[["q0","q1","1"],["q1","q0","0"]],"test":"101"}'>
  <figcaption>…</figcaption>
</figure>
```

`type` can be `dfa`, `nfa`, `pda` (labels `a,X→Y`), `tm` (labels `a→b,R` or `a,b→R`) or `static`. Parse trees use `<figure class="tree" data-tree="S[a S[ε] b]">`.

Math is rendered with [KaTeX](https://katex.org/).
