import Link from 'next/link';
import { ChapterShell } from '@/components/content/ChapterShell';
import { KeyTerms, Primer } from '@/components/content/Primer';
import { Note, Section, Table } from '@/components/content/Blocks';
import { M, MB } from '@/components/content/Math';
import { Exercise } from '@/components/content/Exercise';
import { FASim } from '@/components/machines/FASim';
import { StringQuiz } from '@/components/widgets/StringQuiz';
import { SubsetConstruction } from '@/components/widgets/SubsetConstruction';
import { DerivationPlayground } from '@/components/widgets/DerivationPlayground';
import { ends01NFA, subsetDFA, thirdFromLast, twoOrThree } from '@/content/specs';

export default function NFA() {
  return (
    <ChapterShell
      slug="nfa"
      lede="What if a machine could guess? A nondeterministic finite automaton may have several moves, or none, and accepts when any sequence of guesses works. It is easier to design and, surprisingly, no more powerful."
      chips={[{ text: 'Type 3 · Regular', tone: 'moss' }, { text: 'Nondeterministic', tone: 'clay' }, { text: '45 min' }]}
    >
      <Primer
        analogy={<>Searching a maze by sending a friend down every fork at once: if any friend reaches the exit, you have found a way.</>}
      >
        <p>An <strong>NFA</strong> is a finite machine that is allowed to <em>guess</em>. At a fork it may take several paths at once, and it may even jump between states without reading anything. It says yes if <strong>any</strong> path ends happily.</p>
        <p>That sounds more powerful, but it is not: every NFA can be turned into an ordinary DFA. NFAs are popular because they are much <strong>easier to design</strong> and often much smaller. Regex engines and lexers build NFAs first.</p>
      </Primer>
      <KeyTerms
        terms={[
          {
            term: 'NFA',
            plain: 'Nondeterministic Finite Automaton: a finite machine that may guess.',
            more: <><p>Same parts as a DFA (states, alphabet, start, accepting states), but the rulebook may give <em>several</em> next states, or none.</p></>,
          },
          {
            term: 'Nondeterminism',
            plain: 'Exploring all choices at once; accept if any succeeds.',
            more: <><p>Not randomness, and not luck. Picture parallel worlds, or a finger on every state the machine could be in. The machine accepts if at least one world accepts.</p></>,
          },
          {
            term: <><M t="\varepsilon" />-move</>,
            plain: 'A free jump that reads no input.',
            more: <><p>An arrow labelled <M t="\varepsilon" /> can be taken at any time without consuming a symbol. It is handy for gluing machines together (union, concatenation, star).</p></>,
          },
          {
            term: <><M t="\varepsilon" />-closure</>,
            plain: 'All states reachable using only free moves.',
            more: <><p>Whenever an NFA is in a state, it is effectively also in every state reachable by ε-arrows from it. Simulations always take this closure.</p></>,
          },
          {
            term: <><M t="\mathcal{P}(Q)" />, power set</>,
            plain: 'The set of all subsets of the states.',
            more: <><p>An NFA’s rulebook returns a subset of states, so its type mentions <M t="\mathcal{P}(Q)" />. If there are <M t="n" /> states, there are <M t="2^n" /> subsets. That is where the worst-case blow-up of the subset construction comes from.</p></>,
          },
          {
            term: 'Subset construction',
            plain: 'Turning an NFA into an equivalent DFA.',
            more: <><p>Each DFA state is a <em>set</em> of NFA states: “where could the NFA be now?”. Compute it step by step from the start; only reachable sets are ever created.</p></>,
          },
        ]}
      />

      <Section id="intuition" n={1} title="Intuition" sub="What problem does this machine solve?">
        <p>
          Some patterns are awkward to check deterministically but trivial if you are allowed to <strong>guess</strong>. Take: <em>“the third symbol from the end is a 1”</em>. A DFA must remember the last three symbols at all times (8 combinations). An NFA simply waits, guesses <em>“this 1 is the one”</em>, and then checks that exactly two more symbols follow.
        </p>
        <Note kind="intuition" title="parallel worlds">
          <p>Whenever there is a choice, the machine splits into copies, one per option. A copy with no move dies. The input is accepted if <strong>at least one</strong> copy finishes in an accepting state. This is not randomness: no probabilities are involved, only the question “does a successful path exist?”.</p>
        </Note>
      </Section>

      <Section id="visual-machine" n={2} title="Visual machine" sub="Interactive states, transitions and inputs.">
        <FASim
          spec={thirdFromLast}
          initial="011010"
          presets={['100', '0100', '011010', '110011']}
          tag="Nondeterministic"
          title="The third symbol from the end is 1"
          caption={<><M t="q_0" /> loops on everything. On a 1 it may <em>also</em> jump to <M t="q_1" />, guessing that this is the third-from-last symbol. Wrong guesses die or end outside <M t="q_3" />. The set of lit states is exactly “which of the last three positions held a 1”.</>}
        />
        <div className="explain">
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--clay)' }} />Several arrows, same label</b><M t="q_0" /> has two arrows on 1. Both are followed.</div>
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--muted)' }} />Missing arrows</b><M t="q_3" /> has no outgoing arrows. A copy there that reads more input dies.</div>
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--moss)' }} />ε-arrows</b>Free moves that read nothing (see the next section).</div>
        </div>
      </Section>

      <Section id="execution" n={3} title="Execution" sub="Trace how input moves through the machine.">
        <p>We never explore paths one at a time. Instead we track the <strong>set</strong> of states the machine could be in, which is the “fingers on the diagram” picture.</p>
        <Note kind="definition" title="ε-closure">
          <p><M t="E(S)" /> is the set of states reachable from <M t="S" /> using zero or more ε-arrows. It always contains <M t="S" /> itself.</p>
        </Note>
        <pre><code>{`current = E({q0})
for each symbol a in w:
    current = E( ⋃ { δ(q, a) : q ∈ current } )
accept iff current contains an accepting state`}</code></pre>
        <p>ε-arrows make combining machines easy. This NFA accepts unary strings whose length is a multiple of 2 <em>or</em> of 3. It guesses at the very start which test to run:</p>
        <FASim
          spec={twoOrThree}
          initial="000"
          presets={['', '00', '000', '0000', '00000', '000000']}
          title="Length divisible by 2 or by 3"
          caption="At the start, both ε-arrows fire at once: two worlds begin before any input is read. Length 5 is divisible by neither, so both worlds end outside an accepting state."
        />
        <StringQuiz spec={twoOrThree} strings={['0', '00', '000', '00000', '0000000', '00000000']} />
      </Section>

      <Section id="formal-definition" n={4} title="Formal definition" sub="Mathematical representation and English definition.">
        <Note kind="definition" title="nondeterministic finite automaton">
          <MB t="N = (Q,\ \Sigma,\ \delta,\ q_0,\ F), \qquad \delta : Q \times \Sigma_\varepsilon \to \mathcal{P}(Q)" />
          <p>where <M t="\Sigma_\varepsilon = \Sigma \cup \{\varepsilon\}" /> and <M t="\mathcal{P}(Q)" /> is the set of all subsets of <M t="Q" />.</p>
          <p><M t="N" /> accepts <M t="w" /> if <M t="w = y_1 y_2 \cdots y_m" /> with each <M t="y_i \in \Sigma_\varepsilon" />, and there are states <M t="r_0, \dots, r_m" /> with <M t="r_0 = q_0" />, <M t="r_{i+1} \in \delta(r_i, y_{i+1})" /> and <M t="r_m \in F" />.</p>
        </Note>
        <p>
          <strong>In plain English:</strong> exactly like a DFA, except that each state and symbol (or ε) gives a <em>set</em> of possible next states, possibly empty. The machine accepts if <em>there exists</em> a path that uses up the whole input and ends in an accepting state.
        </p>
        <Table>
          <thead><tr><th></th><th>DFA</th><th>NFA</th></tr></thead>
          <tbody>
            <tr><td>Transition</td><td><M t="\delta(q,a) \in Q" /></td><td><M t="\delta(q,a) \subseteq Q" /></td></tr>
            <tr><td>Moves on ε</td><td>not allowed</td><td>allowed</td></tr>
            <tr><td>Acceptance</td><td>the one run ends in <M t="F" /></td><td><em>some</em> run ends in <M t="F" /></td></tr>
            <tr><td>Complement</td><td>swap accepting states</td><td>determinise first</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section id="corresponding-language" n={5} title="Corresponding language" sub="What language can it recognise?">
        <Note kind="theorem" title="Rabin & Scott, 1959">
          <p>For every NFA there is a DFA recognising the same language. NFAs recognise <strong>exactly the regular languages</strong>.</p>
        </Note>
        <p>The proof is an algorithm, the <strong>subset construction</strong>: each DFA state is a set of NFA states. Step through it on the NFA for “ends in 01”:</p>
        <SubsetConstruction spec={ends01NFA} alphabet={['0', '1']} />
        <p>The resulting DFA has only 3 of the <M t="2^3 = 8" /> possible subsets, and it is exactly the DFA for “ends in 01” from the previous chapter with new names:</p>
        <FASim spec={subsetDFA} initial="1101" presets={['01', '1101', '0110']} title="The DFA built from subsets" hideTrace />
        <Note kind="pitfall" title="the blow-up is real">
          <p>For “the <M t="n" />-th symbol from the end is 1”, the NFA has <M t="n + 1" /> states, but every DFA needs at least <M t="2^n" />. Any two different strings of length <M t="n" /> must lead to different DFA states. Nondeterminism adds no power, but it can be exponentially more <em>succinct</em>.</p>
        </Note>
        <p>NFAs are also the bridge to regular expressions. <strong>Thompson’s construction</strong> turns any regex into an NFA with at most twice as many states as the regex has symbols, gluing pieces together with ε-arrows. Fast regex engines (RE2, Rust’s <code>regex</code>, Go) simulate these NFAs with the set-of-states method, which guarantees linear time. The next chapter, <Link href="/learn/regex">Regular Expressions &amp; Kleene’s Theorem</Link>, builds that NFA step by step and also goes the other way, from a machine back to a regex.</p>
      </Section>

      <Section id="grammar-connection" n={6} title="Grammar connection" sub="How is that language generated?">
        <p>
          A right-linear grammar is naturally nondeterministic. Nothing stops a variable from having two rules that start with the same terminal, and choosing between them is exactly an NFA’s guess. For “third from last is 1”:
        </p>
        <MB t="S \to 0S \mid 1S \mid 1A \qquad A \to 0B \mid 1B \qquad B \to 0C \mid 1C \qquad C \to \varepsilon" />
        <DerivationPlayground
          rules={['S -> 0S | 1S | 1A', 'A -> 0B | 1B', 'B -> 0C | 1C', 'C -> ε']}
          goal="0110"
          title="Generate “0110”: you are the guesser"
          caption="When you produce the first 1, choose S → 1A instead of S → 1S. That choice is the NFA guessing that this 1 is third from the end."
        />
        <p>Converting between NFAs and right-linear grammars is direct in both directions: one variable per state, one rule per arrow, and an ε-rule per accepting state.</p>
      </Section>

      <Section id="limitations" n={7} title="Limitations" sub="What can this machine NOT recognise?">
        <p>
          Since NFAs and DFAs recognise the same languages, they share the same limits. Guessing does not create memory: <M t="\{0^n1^n\}" />, palindromes and balanced brackets are still out of reach. The pumping lemma from the DFA chapter applies unchanged.
        </p>
        <Note kind="pitfall" title="complementing an NFA">
          <p>Swapping accepting and non-accepting states does <strong>not</strong> complement an NFA. An NFA accepts if <em>some</em> branch accepts; after swapping, it accepts if <em>some</em> branch rejects, which is a different condition. Determinise first, then swap.</p>
        </Note>
        <p>
          Nondeterminism is a theme we will meet three more times. For pushdown automata it <strong>does</strong> add power. For linear bounded automata, nobody knows. For Turing machines it adds no power, but whether it adds <em>speed</em> is the P vs NP question.
        </p>
      </Section>

      <Section id="exercises" n={8} title="Exercises" sub="Build machines and test strings.">
        <StringQuiz spec={thirdFromLast} strings={['100', '011', '1000', '0101', '1111', '00100']} title="Third symbol from the end is 1?" />
        <Exercise n={1} level="easy" q="Design a 4-state NFA for strings over {a, b} that contain abb.">
          <p><M t="q_0" /> loops on a and b; <M t="q_0 \xrightarrow{a} q_1 \xrightarrow{b} q_2 \xrightarrow{b} q_3" />; <M t="q_3" /> accepts and loops on a and b. The machine guesses where the occurrence begins.</p>
        </Exercise>
        <Exercise n={2} level="medium" q={<>Compute <M t="E(\{s\})" /> in the “multiple of 2 or 3” NFA, and the DFA state reached after reading one 0.</>}>
          <p><M t="E(\{s\}) = \{s, a_0, b_0\}" />, which is accepting because length 0 is a multiple of both. After one 0: <M t="\{a_1, b_1\}" />, not accepting.</p>
        </Exercise>
        <Exercise n={3} level="medium" q="Show that every NFA can be converted into one with a single accepting state. Is the same true for DFAs?">
          <p>NFA: add a new state <M t="f" />, add ε-arrows from every old accepting state to <M t="f" />, and make <M t="f" /> the only accepting state. DFA: no. The language <M t="\{\varepsilon, a\}" /> needs two accepting states, because after <M t="\varepsilon" /> and after <M t="a" /> the DFA must be in different states (append <M t="a" /> to see this).</p>
        </Exercise>
        <Exercise n={4} level="hard" q="Why does simulating an NFA take polynomial time while the subset construction can take exponential time?">
          <p>The simulation only visits the <M t="|w| + 1" /> subsets that actually occur on this input. The construction precomputes transitions for every reachable subset, potentially <M t="2^{|Q|}" /> of them. Regex engines simulate, or build DFA states lazily and cache them.</p>
        </Exercise>
      </Section>
    </ChapterShell>
  );
}
