# Contributing to Automata, A to Z

Thanks for helping make this course better! Contributions of every size are welcome — a typo fix is as valuable as a new chapter.

## Ways to contribute

- **Report an error.** Found a wrong proof, a buggy diagram, or a confusing explanation? [Open an issue](https://github.com/imhasnainizhar/automata-theory/issues/new/choose) and point to the chapter and section.
- **Improve an explanation.** Better intuition, a clearer example, or a missing pitfall.
- **Add exercises.** Every chapter benefits from more problems with worked solutions.
- **Add an interactive machine.** Diagrams are just JSON in the HTML — see below.
- **Translate.** Open an issue first so we can agree on a folder structure.

## Running the site locally

No build step and no dependencies:

```bash
git clone https://github.com/imhasnainizhar/automata-theory.git
cd automata-theory
python -m http.server 8000
# open http://localhost:8000
```

Before opening a pull request, run the checker (Python 3, standard library only):

```bash
python scripts/check_site.py
```

It verifies that every internal link points to an existing page or heading, that every
diagram's JSON spec parses and references only declared states, and that there are no
stray `$` signs outside math. CI runs the same script on every push and pull request.

## Project layout

```
index.html                 home page and course map
NN-slug.html               one file per chapter (01 … 17)
assets/style.css           design tokens (light + dark) and components
assets/site.js             sidebar, chapter list, progress, theme, KaTeX
assets/automata.js         diagram renderer + DFA/NFA/PDA/TM simulators, widgets
scripts/check_site.py      consistency checks used by CI
```

To add a chapter: copy an existing chapter file, change `data-page` on `<body>`, and add an entry to the `CHAPTERS` array at the top of `assets/site.js`.

## Writing style

- **Intuition before formalism.** Each new idea should open with an `Intuition` box.
- Use the callout classes: `box intuition`, `box definition`, `box theorem`, `box pitfall`, `box example`, `box takeaways`, and `div.proof` (add `sketch` for proof sketches).
- Exercises use `<details class="ex">` with a difficulty tag: `<span class="lvl easy|med|hard">`.
- Notation follows Sipser’s *Introduction to the Theory of Computation* where possible.
- Math is KaTeX with `$…$` (inline) and `$$…$$` (display). **Never use a bare `$` in prose** — write “dollars” instead. Inside math write `\lt` instead of `<`.

## Diagram specs

```html
<figure class="fa" data-fa='{"type":"dfa","w":520,"h":190,
  "states":{"q0":[110,105],"q1":[300,105]},
  "start":"q0","accept":["q1"],
  "edges":[["q0","q1","1"],["q1","q0","0"],["q0","q0","0",null,"up"]],
  "test":"101"}'>
  <figcaption>…</figcaption>
</figure>
```

| Field | Meaning |
|---|---|
| `type` | `dfa`, `nfa`, `pda`, `tm`, or `static` (no simulator) |
| `states` | name → `[x, y]` in the viewBox; `q0` renders as q₀, `q_acc` as q<sub>acc</sub> |
| `edges` | `[from, to, label, bend?, loopDir?]`; `bend` curves the edge, `loopDir` is `up`/`down`/`left`/`right` for self-loops |
| labels | FA: `0,1` (`ε` allowed) · PDA: `a,X→Y` · TM: `a→b,R` or `a,b→R`; separate multiple rules with `;` |
| `accept`, `reject`, `dead` | lists of state names |
| `test` | default input for the simulator |

Parse trees: `<figure class="tree" data-tree="S[a S[ε] b]">`.

## Pull requests

1. Fork and create a branch (`fix/nfa-typo`, `content/pumping-examples`, …).
2. Keep each PR focused on one change.
3. Run `python scripts/check_site.py` and preview the pages you touched in light **and** dark mode, and at phone width.
4. Describe *what* you changed and *why* in the PR.

By contributing you agree that your contributions are licensed under the project’s licenses: MIT for code and CC BY 4.0 for course content.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).
