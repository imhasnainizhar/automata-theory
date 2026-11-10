import { ChapterShell } from '@/components/content/ChapterShell';
import { KeyTerms, Primer } from '@/components/content/Primer';
import { Note, Section, Table } from '@/components/content/Blocks';
import { M, MB } from '@/components/content/Math';
import { Exercise } from '@/components/content/Exercise';
import { FASim } from '@/components/machines/FASim';
import { StringQuiz } from '@/components/widgets/StringQuiz';
import { LexerDemo } from '@/components/widgets/LexerDemo';
import { DerivationPlayground } from '@/components/widgets/DerivationPlayground';
import { PumpGame } from '@/components/widgets/PumpGame';
import { DfaBuilder } from '@/components/widgets/DfaBuilder';
import { div3, ends01, evenZeros } from '@/content/specs';

export default function DFA() {
  return (
    <ChapterShell
      slug="dfa"
      lede="The simplest useful machine: a finite set of states, and exactly one move for every symbol. Designing one comes down to a single question: what must I remember?"
      chips={[{ text: 'Type 3 · Regular', tone: 'moss' }, { text: 'Deterministic', tone: 'teal' }, { text: '45 min' }]}
    >
      <Primer
        analogy={<>A checklist with one box ticked at a time: each new letter tells you which box to tick next, and some boxes mean “yes”.</>}
      >
        <p>A <strong>DFA</strong> is the simplest useful machine. It reads a string once, from left to right, and always knows exactly what to do next. Its memory is just one of a handful of <em>states</em>, fixed in advance and never growing.</p>
        <p>Designing one is a puzzle: <strong>what is the smallest thing I need to remember about what I have read so far?</strong> To check whether a binary number is divisible by 3, you do not need the number, only its remainder (0, 1 or 2). So three states are enough, however long the number is.</p>
      </Primer>
      <KeyTerms
        terms={[
          {
            term: 'DFA',
            plain: 'Deterministic Finite Automaton: a finite-state machine with no choices.',
            more: <><p><strong>Deterministic</strong>: one next move. <strong>Finite</strong>: a fixed number of states. <strong>Automaton</strong>: a machine. Together, a machine with limited, fixed memory that always knows what to do.</p></>,
          },
          {
            term: <><M t="\delta" /> (delta), transition function</>,
            plain: 'The rulebook: (state, symbol) → next state.',
            more: <><p>Written <M t="\delta(q, a) = p" />: “in state <M t="q" />, reading <M t="a" />, go to <M t="p" />”. For a DFA it must give an answer for <em>every</em> state and symbol.</p></>,
          },
          {
            term: <><M t="q_0" />, start state</>,
            plain: 'Where every run begins.',
            more: <><p>Drawn with an arrow coming from nowhere. Before any input is read, the machine is here.</p></>,
          },
          {
            term: <><M t="F" />, accepting states</>,
            plain: 'The “yes” states (double circles).',
            more: <><p>If the machine finishes reading in one of these, the string is accepted. A machine can have several accepting states, or even none (then it accepts nothing).</p></>,
          },
          {
            term: 'Run',
            plain: 'The sequence of states visited while reading a string.',
            more: <><p>For a DFA there is exactly one run per input, which is what “deterministic” buys you.</p></>,
          },
          {
            term: 'Regular language',
            plain: 'Any language some DFA can recognise.',
            more: <><p>These are exactly the patterns that need only bounded memory: “ends in 01”, “even number of 0s”, valid identifiers. Things that need counting without limit, like <M t="a^nb^n" />, are not regular.</p></>,
          },
          {
            term: 'Pumping lemma',
            plain: 'A tool to prove a language is NOT regular.',
            more: <><p>Long inputs force a DFA to repeat a state, which creates a loop the machine cannot count. If repeating that loop (“pumping”) breaks membership in the language, no DFA could have recognised it.</p></>,
          },
        ]}
      />

      <Section id="intuition" n={1} title="Intuition" sub="What problem does this machine solve?">
        <p>
          A DFA answers yes/no questions about a string while reading it <strong>once</strong>, left to right, with a <strong>fixed amount of memory</strong> that does not grow with the input. Is this binary number divisible by 3? Does this word end in “ing”? Is this a valid identifier?
        </p>
        <Note kind="intuition" title="a summary of the past">
          <p>
            Picture someone reading a very long string through a tiny window. They cannot look back, and they have a small whiteboard that can show one of a fixed set of messages. After each symbol they may rewrite the board. At the end they must answer by looking only at the board.
          </p>
          <p>The messages are the <strong>states</strong>. The design challenge is choosing messages that capture <em>everything about the past that could matter for the future</em>, and nothing more.</p>
        </Note>
        <p>
          Take divisibility by 3. We cannot store the number, which can be arbitrarily large. But reading bit <M t="b" /> turns a number <M t="n" /> into <M t="2n + b" />, and
        </p>
        <MB t="(2n + b) \bmod 3 \;=\; \big(2\,(n \bmod 3) + b\big) \bmod 3." />
        <p>So the remainder alone determines the next remainder. Three remainders means three states, whatever the length of the input.</p>
      </Section>

      <Section id="visual-machine" n={2} title="Visual machine" sub="Interactive states, transitions and inputs.">
        <FASim
          spec={div3}
          initial="10010"
          presets={['0', '11', '110', '1001', '111', '10010']}
          tag="Interactive"
          title="Binary numbers divisible by 3"
          caption={<>State <M t="r_k" /> means “the bits so far have remainder <M t="k" />”. From <M t="r_1" />, reading 0 gives <M t="2" /> and reading 1 gives <M t="3 \equiv 0" />. From <M t="r_2" />, 0 gives <M t="4 \equiv 1" /> and 1 gives <M t="5 \equiv 2" />.</>}
        />
        <div className="explain">
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--ink)' }} />States</b>Circles. The machine is in exactly one of them at any moment.</div>
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--muted)' }} />Start arrow</b>Where every run begins, before any input is read.</div>
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--moss)' }} />Accepting states</b>Double circles. If the input ends here, the answer is yes.</div>
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--clay)' }} />Transitions</b>Arrows labelled with symbols. Every state has exactly one arrow per symbol.</div>
        </div>
        <p>A second classic: an even number of 0s. Here the state only needs to record the <em>parity</em> of the zeros seen so far.</p>
        <FASim spec={evenZeros} initial="10100" presets={['', '00', '1001', '10100']} title="Even number of 0s" hideTrace />
      </Section>

      <Section id="execution" n={3} title="Execution" sub="Trace how input moves through the machine.">
        <p>
          Running a DFA is mechanical: start in the start state, and for each symbol follow the unique arrow labelled with it. At the end, accept if and only if the current state is accepting. Here is “ends in 01”, where the states record how much of <code>01</code> has just been seen:
        </p>
        <FASim
          spec={ends01}
          initial="10101"
          presets={['01', '10101', '0110', '0001']}
          title="Trace: strings ending in 01"
          caption="The trace lists every step. Notice the arrows out of q₂: after …01, a 0 means the input now ends in 0 (go to q₁), not back to the start. That overlap is easy to forget."
        />
        <Table>
          <thead><tr><th>Step</th><th>State before</th><th>Read</th><th>State after</th></tr></thead>
          <tbody>
            <tr><td>1</td><td><M t="q_0" /></td><td>1</td><td><M t="q_0" /></td></tr>
            <tr><td>2</td><td><M t="q_0" /></td><td>0</td><td><M t="q_1" /></td></tr>
            <tr><td>3</td><td><M t="q_1" /></td><td>1</td><td><M t="q_2" /></td></tr>
            <tr><td>4</td><td><M t="q_2" /></td><td>0</td><td><M t="q_1" /></td></tr>
            <tr><td>5</td><td><M t="q_1" /></td><td>1</td><td><M t="q_2" /> ✓ accept</td></tr>
          </tbody>
        </Table>
        <p>Before you run it, predict:</p>
        <StringQuiz spec={div3} strings={['0', '11', '100', '110', '1001', '1111']} title="Divisible by 3?" />
      </Section>

      <Section id="formal-definition" n={4} title="Formal definition" sub="Mathematical representation and English definition.">
        <Note kind="definition" title="deterministic finite automaton">
          <MB t="M = (Q,\ \Sigma,\ \delta,\ q_0,\ F)" />
          <ul>
            <li><M t="Q" /> — a finite set of <strong>states</strong>;</li>
            <li><M t="\Sigma" /> — a finite <strong>input alphabet</strong>;</li>
            <li><M t="\delta : Q \times \Sigma \to Q" /> — the <strong>transition function</strong>, defined for every pair;</li>
            <li><M t="q_0 \in Q" /> — the <strong>start state</strong>;</li>
            <li><M t="F \subseteq Q" /> — the <strong>accepting states</strong>.</li>
          </ul>
        </Note>
        <p>
          <strong>In plain English:</strong> a DFA is a finite list of states, an alphabet, a rule that says for every state and every symbol which single state comes next, a starting state, and a set of “yes” states.
        </p>
        <p>To talk about whole strings, extend <M t="\delta" /> to the <strong>extended transition function</strong>:</p>
        <MB t="\hat\delta(q, \varepsilon) = q \qquad \hat\delta(q, wa) = \delta\big(\hat\delta(q, w),\, a\big)" />
        <p>In words: on the empty string, stay where you are; to process <M t="wa" />, first process <M t="w" />, then take one step on <M t="a" />. The machine <strong>accepts</strong> <M t="w" /> when <M t="\hat\delta(q_0, w) \in F" />, and its language is</p>
        <MB t="L(M) = \{\, w \in \Sigma^* : \hat\delta(q_0, w) \in F \,\}." />
        <p>The same machine as a <strong>transition table</strong> (→ marks the start state, * an accepting state):</p>
        <Table>
          <thead><tr><th>δ</th><th className="c">0</th><th className="c">1</th></tr></thead>
          <tbody>
            <tr><td>→ * <M t="r_0" /></td><td className="c"><M t="r_0" /></td><td className="c"><M t="r_1" /></td></tr>
            <tr><td><M t="r_1" /></td><td className="c"><M t="r_2" /></td><td className="c"><M t="r_0" /></td></tr>
            <tr><td><M t="r_2" /></td><td className="c"><M t="r_1" /></td><td className="c"><M t="r_2" /></td></tr>
          </tbody>
        </Table>
        <Note kind="pitfall" title="totality">
          <p>
            <M t="\delta" /> must be defined for <em>every</em> state and symbol. Diagrams often omit arrows into a <strong>dead state</strong>, a non-accepting state that loops on everything. A missing arrow always means “go to the dead state”.
          </p>
        </Note>
      </Section>

      <Section id="corresponding-language" n={5} title="Corresponding language" sub="What language can it recognise?">
        <Note kind="theorem" title="regular languages">
          <p>A language is <strong>regular</strong> if some DFA recognises it. By Kleene’s theorem these are exactly the languages described by <strong>regular expressions</strong>, built from symbols with union <M t="\cup" />, concatenation and star <M t="{}^*" />.</p>
        </Note>
        <Table>
          <thead><tr><th>Language</th><th>Regular expression</th></tr></thead>
          <tbody>
            <tr><td>ends in 01</td><td><M t="(0 \cup 1)^*01" /></td></tr>
            <tr><td>even number of 0s</td><td><M t="(1 \cup 01^*0)^*" /></td></tr>
            <tr><td>no two consecutive 1s</td><td><M t="(0 \cup 10)^*(\varepsilon \cup 1)" /></td></tr>
            <tr><td>identifiers</td><td><M t="[a\text{-}z]\,[a\text{-}z0\text{-}9]^*" /></td></tr>
          </tbody>
        </Table>
        <p>Regular languages are <strong>closed</strong> under union, intersection, complement, concatenation, star and reversal. For DFAs two of these are especially easy:</p>
        <ul>
          <li><strong>Complement</strong>: swap accepting and non-accepting states (this needs a complete DFA).</li>
          <li><strong>Intersection and union</strong>: the <em>product construction</em> runs two DFAs in parallel, with states that are pairs <M t="(p, q)" />.</li>
        </ul>
        <h3>Where you meet regular languages every day: lexers</h3>
        <p>Every token type in a programming language (identifiers, numbers, operators) is a regular language. A compiler’s first stage combines them all into one DFA that splits source code into tokens:</p>
        <LexerDemo />
      </Section>

      <Section id="grammar-connection" n={6} title="Grammar connection" sub="How is that language generated?">
        <p>
          Regular languages are generated by <strong>right-linear grammars</strong>, in which every rule has the form <M t="A \to aB" />, <M t="A \to a" /> or <M t="A \to \varepsilon" />. The translation from a DFA is direct:
        </p>
        <ul>
          <li>one variable per state;</li>
          <li>a rule <M t="A \to aB" /> for every transition <M t="\delta(A, a) = B" />;</li>
          <li>a rule <M t="A \to \varepsilon" /> for every accepting state.</li>
        </ul>
        <p>For “ends in 01” (with <M t="S = q_0" />, <M t="A = q_1" />, <M t="B = q_2" />), the grammar is <M t="S \to 0A \mid 1S" />, <M t="A \to 0A \mid 1B" />, <M t="B \to 0A \mid 1S \mid \varepsilon" />. A derivation simulates a run of the DFA: the single variable at the end of the string is the current state.</p>
        <DerivationPlayground
          rules={['S -> 0A | 1S', 'A -> 0A | 1B', 'B -> 0A | 1S | ε']}
          goal="1001"
          title="Generate “1001” with the right-linear grammar"
          caption="The variable at the end always plays the role of the DFA state. The tree grows along its right edge only, which is why such grammars are called linear."
        />
      </Section>

      <Section id="limitations" n={7} title="Limitations" sub="What can this machine NOT recognise?">
        <p>
          A DFA with <M t="p" /> states that reads <M t="p" /> symbols visits <M t="p + 1" /> states, so by the pigeonhole principle <strong>some state repeats</strong>. The input between the two visits drove the machine around a <strong>loop</strong>, and the machine cannot tell how many times it went around.
        </p>
        <Note kind="theorem" title="pumping lemma for regular languages">
          <p>If <M t="L" /> is regular, there is a <M t="p" /> such that every <M t="s \in L" /> with <M t="|s| \ge p" /> splits as <M t="s = xyz" /> with <M t="|xy| \le p" />, <M t="|y| \ge 1" />, and <M t="xy^iz \in L" /> for every <M t="i \ge 0" />.</p>
        </Note>
        <p>
          So <M t="\{0^n1^n\}" /> is not regular: in <M t="0^p1^p" /> the loop <M t="y" /> lies inside the zeros, and pumping it changes the number of 0s without changing the 1s. Play the proof as a game:
        </p>
        <PumpGame />
        <Table>
          <thead><tr><th>Not regular</th><th>Why, intuitively</th></tr></thead>
          <tbody>
            <tr><td><M t="\{0^n1^n\}" />, balanced brackets</td><td>needs to count without bound</td></tr>
            <tr><td>palindromes <M t="\{w : w = w^R\}" /></td><td>needs to remember the whole first half</td></tr>
            <tr><td><M t="\{1^{n^2}\}" />, <M t="\{1^p : p \text{ prime}\}" /></td><td>gaps between lengths grow, but loops repeat at a fixed rate</td></tr>
          </tbody>
        </Table>
        <Note kind="pitfall">
          <p>The pumping lemma can only show that a language is <em>not</em> regular. To show that a language <em>is</em> regular, build a DFA or a regular expression.</p>
        </Note>
      </Section>

      <Section id="exercises" n={8} title="Exercises" sub="Build machines and test strings.">
        <DfaBuilder task="ends-in-1" />
        <DfaBuilder task="no-11" />
        <Exercise n={1} level="easy" q="Design a DFA for binary strings whose length is a multiple of 3.">
          <p>Three states <M t="c_0, c_1, c_2" /> count the length mod 3; every symbol moves <M t="c_i \to c_{(i+1) \bmod 3}" />. Start and accept at <M t="c_0" />, so <M t="\varepsilon" /> is accepted.</p>
        </Exercise>
        <Exercise n={2} level="medium" q="How many states does a DFA need for “even number of 0s AND odd number of 1s”? Describe it.">
          <p>Four: pairs (parity of 0s, parity of 1s), built with the product construction. Start at (even, even); accept (even, odd). A 0 flips the first parity and a 1 flips the second.</p>
        </Exercise>
        <Exercise n={3} level="medium" q="Explain why every finite language is regular.">
          <p>Build a trie with one state per prefix of a word in the language, plus a dead state. Finitely many words have finitely many prefixes, so the automaton is finite. Accept the states that are complete words.</p>
        </Exercise>
        <Exercise n={4} level="hard" q={<>Prove that <M t="\{a^nb^m : n \gt m\}" /> is not regular.</>}>
          <p>Choose <M t="s = a^{p+1}b^p" />. Every legal <M t="y" /> is <M t="a^k" /> with <M t="k \ge 1" />. Pump <em>down</em> (<M t="i = 0" />): <M t="a^{p+1-k}b^p" /> has at most as many a’s as b’s, so it is not in the language. Pumping up would not work here, which is why <M t="i = 0" /> matters.</p>
        </Exercise>
      </Section>
    </ChapterShell>
  );
}
