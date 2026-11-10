import { ChapterShell } from '@/components/content/ChapterShell';
import { Note, Section, Table } from '@/components/content/Blocks';
import { M, MB } from '@/components/content/Math';
import { Exercise } from '@/components/content/Exercise';
import { TMSim } from '@/components/machines/TMSim';
import { StringQuiz } from '@/components/widgets/StringQuiz';
import { ntmGuess } from '@/content/specs';

function ComputationTree() {
  const nodes: [number, number, string, 'acc' | 'rej' | 'run'][] = [
    [300, 30, 'C₀', 'run'],
    [150, 100, 'C₁', 'run'], [300, 100, 'C₂', 'run'], [450, 100, 'C₃', 'run'],
    [90, 170, 'rej', 'rej'], [200, 170, 'C₄', 'run'], [300, 170, '…', 'run'], [410, 170, 'C₅', 'run'], [510, 170, '∞', 'run'],
    [200, 240, 'acc', 'acc'], [410, 240, 'rej', 'rej'],
  ];
  const edges: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 6], [3, 7], [3, 8], [5, 9], [7, 10]];
  return (
    <figure className="panel" style={{ marginInline: 0 }}>
      <div className="canvas">
        <svg viewBox="0 0 600 280" role="img" aria-label="A tree of configurations">
          {edges.map(([a, b], i) => (
            <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={b === 5 || b === 9 || (a === 0 && b === 1) ? 'var(--moss)' : '#a89b88'} strokeWidth={b === 5 || b === 9 || (a === 0 && b === 1) ? 3 : 1.4} />
          ))}
          {nodes.map(([x, y, t, k], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={18} fill={k === 'acc' ? 'var(--moss-soft)' : k === 'rej' ? 'var(--clay-soft)' : '#fffdf8'} stroke={k === 'acc' ? 'var(--moss)' : k === 'rej' ? 'var(--clay)' : 'var(--ink)'} strokeWidth={1.6} />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" style={{ font: '600 12px var(--font-sans)', fill: 'var(--ink)' }}>{t}</text>
            </g>
          ))}
          <text x={560} y={170} style={{ font: '500 12px var(--font-sans)', fill: 'var(--muted)' }}>loops</text>
        </svg>
      </div>
      <figcaption className="panel-caption">
        <b>A nondeterministic computation is a tree.</b> Each configuration branches once per applicable move. The machine accepts if <em>any</em> branch reaches accept (the green path), even if other branches reject or run forever. A simulator must explore the tree <b>breadth-first</b>: depth-first could fall down the infinite branch and never return.
      </figcaption>
    </figure>
  );
}

export default function NTM() {
  return (
    <ChapterShell
      slug="ntm"
      lede="A Turing machine allowed to branch. It recognises nothing new, but how fast it could answer, compared with a deterministic machine, is the P vs NP question."
      chips={[{ text: 'Type 0 · Recursively enumerable', tone: 'clay' }, { text: 'Nondeterministic', tone: 'clay' }, { text: '40 min' }]}
    >
      <Section id="intuition" n={1} title="Intuition" sub="What problem does this machine solve?">
        <p>
          Many problems are hard to <em>solve</em> but easy to <em>check</em>. Is 391 composite? Finding a factor takes search, but given “17”, checking <M t="17 \times 23 = 391" /> is instant. A Sudoku can take an hour to solve and seconds to verify.
        </p>
        <Note kind="intuition" title="guess, then check">
          <p>A nondeterministic Turing machine (NTM) captures “search” by <strong>guessing</strong>: it writes down a candidate answer nondeterministically, one symbol per branch, then runs an ordinary deterministic check. It accepts if <em>some</em> guess passes. All the difficulty of searching disappears into the branching.</p>
        </Note>
      </Section>

      <Section id="visual-machine" n={2} title="Visual machine" sub="Interactive states, transitions and inputs.">
        <TMSim
          spec={ntmGuess}
          initial="0110"
          presets={['0', '1', '011', '0110', '1010', '1101']}
          tag="Nondeterministic"
          title="Contains 11, or ends in 0"
          caption={<>At each 1, <M t="q_0" /> may keep scanning or guess “the next symbol is also a 1” (<M t="q_1" />). At each 0, it may guess “this is the last symbol” (<M t="q_2" />). Every live branch is shown with its own tape and head.</>}
        />
        <p>The machine is deliberately simple, so you can follow every branch. The same pattern (branch, check, accept if any branch succeeds) scales to guessing factors, paths or colourings.</p>
      </Section>

      <Section id="execution" n={3} title="Execution" sub="Trace how input moves through the machine.">
        <ComputationTree />
        <p>
          The simulator above uses breadth-first search: after <M t="k" /> moves it holds every configuration reachable in exactly <M t="k" /> moves, with duplicates removed. If any of them is accepting, the input is accepted.
        </p>
        <StringQuiz spec={ntmGuess} strings={['0', '1', '11', '101', '110', '1001']} title="Contains 11 or ends in 0?" />
      </Section>

      <Section id="formal-definition" n={4} title="Formal definition" sub="Mathematical representation and English definition.">
        <Note kind="definition" title="nondeterministic Turing machine">
          <MB t="N = (Q,\ \Sigma,\ \Gamma,\ \delta,\ q_0,\ q_\text{acc},\ q_\text{rej}), \qquad \delta : Q \times \Gamma \to \mathcal{P}(Q \times \Gamma \times \{L, R\})" />
          <p><M t="N" /> accepts <M t="w" /> if <strong>some</strong> branch of its computation tree on <M t="w" /> reaches <M t="q_\text{acc}" />. <M t="N" /> is a <strong>decider</strong> if every branch halts on every input.</p>
        </Note>
        <p>
          <strong>In plain English:</strong> exactly a Turing machine, except that each state and symbol may allow several moves (or none). It accepts when at least one sequence of choices leads to the accept state. Branches that reject or loop do not matter, as long as one branch accepts.
        </p>
      </Section>

      <Section id="corresponding-language" n={5} title="Corresponding language" sub="What language can it recognise?">
        <Note kind="theorem" title="NTM = DTM in power">
          <p>Every nondeterministic Turing machine has an equivalent deterministic one. NTMs recognise exactly the <strong>recursively enumerable</strong> languages and decide exactly the <strong>decidable</strong> ones.</p>
        </Note>
        <p>
          <strong>Proof idea.</strong> A deterministic machine with three tapes explores the computation tree breadth-first. Tape 1 keeps the input, tape 2 simulates one branch, and tape 3 holds the <em>address</em> of the branch being tried, a sequence of choices like <code>2,1,3</code>. Try every address in order of length. If some branch accepts at depth <M t="d" />, it is found after checking all shorter addresses, so it is always found.
        </p>
        <p>
          The price: if each step has at most <M t="b" /> choices, a branch of length <M t="t" /> may require trying about <M t="b^t" /> addresses. Nondeterminism adds <strong>no power</strong>, but the simulation can be <strong>exponentially slower</strong>. Whether that slowdown is ever necessary is the central open question of computer science.
        </p>
        <Table>
          <thead><tr><th>Machine family</th><th>Does nondeterminism add power?</th></tr></thead>
          <tbody>
            <tr><td>Finite automata</td><td className="no">No: subset construction (with up to 2ⁿ states).</td></tr>
            <tr><td>Pushdown automata</td><td className="yes">Yes: DCFL ⊊ CFL.</td></tr>
            <tr><td>Linear bounded automata</td><td>Unknown (the first LBA problem).</td></tr>
            <tr><td>Turing machines</td><td className="no">No: breadth-first simulation (with exponential slowdown).</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section id="grammar-connection" n={6} title="Grammar connection" sub="How is that language generated?">
        <p>
          Derivations in a grammar are inherently nondeterministic: at each step you choose a rule and a position. An NTM recognises the language of an unrestricted grammar in the most natural way possible. It <strong>guesses a derivation</strong> on its tape, rewriting from <M t="S" /> one step at a time, and accepts if it reaches <M t="w" />.
        </p>
        <p>
          Seen this way, every grammar is a nondeterministic machine and every derivation is an accepting branch. A deterministic machine has to search through derivations, while the nondeterministic one just picks them.
        </p>
      </Section>

      <Section id="limitations" n={7} title="Limitations" sub="What can this machine NOT recognise?">
        <p>
          Since NTMs and DTMs have the same power, they have the same limits: the Halting Problem, Rice’s theorem and every other undecidable problem stay undecidable. Guessing does not help with questions that have no finite certificate.
        </p>
        <h3>Where nondeterminism matters: P vs NP</h3>
        <Note kind="definition">
          <ul>
            <li><M t="\mathbf{P}" />: problems a <strong>deterministic</strong> TM decides in polynomial time, roughly the problems we can solve efficiently.</li>
            <li><M t="\mathbf{NP}" />: problems a <strong>nondeterministic</strong> TM decides in polynomial time. Equivalently, problems whose “yes” answers have a short certificate that can be checked quickly.</li>
          </ul>
        </Note>
        <Table>
          <thead><tr><th>Problem in NP</th><th>Certificate (the NTM’s guess)</th></tr></thead>
          <tbody>
            <tr><td>SAT: is this Boolean formula satisfiable?</td><td>a satisfying assignment</td></tr>
            <tr><td>Hamiltonian path: is there a route through every vertex once?</td><td>the route</td></tr>
            <tr><td>Clique: are there <M t="k" /> mutually connected people?</td><td>the <M t="k" /> people</td></tr>
            <tr><td>Composite: is <M t="N" /> not prime?</td><td>a non-trivial factor</td></tr>
          </tbody>
        </Table>
        <Note kind="theorem" title="the open question">
          <p>Is <M t="\mathbf{P} = \mathbf{NP}" />? In other words, can every problem whose solutions are easy to check also be solved easily? Most researchers believe not, but nobody has proved it. SAT is <strong>NP-complete</strong> (Cook–Levin): a fast algorithm for SAT would give a fast algorithm for every problem in NP.</p>
        </Note>
      </Section>

      <Section id="exercises" n={8} title="Exercises" sub="Build machines and test strings.">
        <Exercise n={1} level="easy" q="Describe an NTM that accepts binary strings containing two equal symbols separated by exactly three positions.">
          <p>Scan right. At some point, nondeterministically remember the current symbol in the state, move right four cells, and accept if the symbol there is the same. Branches that guess the wrong position reject.</p>
        </Exercise>
        <Exercise n={2} level="medium" q="Why must the deterministic simulation of an NTM use breadth-first rather than depth-first search?">
          <p>A branch may run forever. Depth-first search could follow that branch endlessly and never reach an accepting branch elsewhere in the tree. Breadth-first search reaches every node at depth <M t="d" /> after finitely many steps.</p>
        </Exercise>
        <Exercise n={3} level="medium" q="Describe a polynomial-time NTM for COMPOSITE = { n : n is not prime } (n in binary).">
          <p>Guess a number <M t="d" /> with <M t="1 \lt d \lt n" />, writing its bits nondeterministically (at most <M t="\log n" /> choices). Divide <M t="n" /> by <M t="d" /> deterministically in polynomial time. Accept if the remainder is 0.</p>
        </Exercise>
        <Exercise n={4} level="hard" q="If someone proves an NP-complete problem is in P, what follows?">
          <p>Every NP problem reduces to it in polynomial time, so every NP problem would be in P: <M t="\mathbf{P} = \mathbf{NP}" />. Much of modern cryptography relies on certain problems being hard and would in principle be breakable.</p>
        </Exercise>
      </Section>
    </ChapterShell>
  );
}
