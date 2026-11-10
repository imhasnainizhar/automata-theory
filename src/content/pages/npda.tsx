import { ChapterShell } from '@/components/content/ChapterShell';
import { Note, Section, Table } from '@/components/content/Blocks';
import { M, MB } from '@/components/content/Math';
import { Exercise } from '@/components/content/Exercise';
import { PDASim } from '@/components/machines/PDASim';
import { StringQuiz } from '@/components/widgets/StringQuiz';
import { DerivationPlayground } from '@/components/widgets/DerivationPlayground';
import { npdaFromGrammar, npdaOneOrTwo, npdaPal } from '@/content/specs';

export default function NPDA() {
  return (
    <ChapterShell
      slug="npda"
      lede="A pushdown automaton that may guess. Unlike finite automata, here guessing buys real power: nondeterministic PDAs recognise exactly the context-free languages, the languages of grammars."
      chips={[{ text: 'Type 2 · Context-free', tone: 'ochre' }, { text: 'Nondeterministic', tone: 'clay' }, { text: '50 min' }]}
    >
      <Section id="intuition" n={1} title="Intuition" sub="What problem does this machine solve?">
        <p>
          Check whether a string is an even-length palindrome, such as <code>abba</code> or <code>baab</code>. The plan is obvious: push the first half, then pop while matching the second half. But <strong>where is the middle?</strong> Reading left to right, you cannot know until the string ends.
        </p>
        <Note kind="intuition" title="guess, then verify">
          <p>An NPDA simply <em>guesses</em> the middle. At every position it splits into two worlds: one keeps pushing, the other switches to popping. Only the world that guessed correctly survives to the end with an empty stack. This idea, nondeterministically guessing structure and then checking it, is the heart of context-free recognition.</p>
        </Note>
      </Section>

      <Section id="visual-machine" n={2} title="Visual machine" sub="Interactive states, transitions and inputs.">
        <PDASim
          spec={npdaPal}
          initial="abba"
          presets={['', 'aa', 'abba', 'abab', 'babbab', 'aab']}
          tag="Nondeterministic"
          title="Even palindromes: guess the middle"
          caption={<>The ε-arrow <M t="q_2 \to q_3" /> is the guess. In <b>Parallel worlds</b> you see every live configuration with its own stack. Switch to <b>Accepting branch</b> to replay the one world that guessed right.</>}
        />
        <div className="explain">
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--clay)' }} />The guess</b>An ε-move that is always available, so the machine may take it at any time.</div>
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--ochre)' }} />One stack per world</b>Every branch has its own stack. That is why PDAs cannot be determinised.</div>
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--moss)' }} />Acceptance</b>At least one world reads all the input and ends in an accepting state.</div>
        </div>
      </Section>

      <Section id="execution" n={3} title="Execution" sub="Trace how input moves through the machine.">
        <p>
          A nondeterministic run is a <strong>tree</strong> of configurations: each node branches once per applicable move. The simulator explores the tree breadth-first, one input symbol at a time, keeping every live configuration. That is the “parallel worlds” view.
        </p>
        <p>This machine accepts <M t="\{a^ib^j : j = i \text{ or } j = 2i\}" />. It pushes the a’s, then guesses which of the two checks to run:</p>
        <PDASim
          spec={npdaOneOrTwo}
          initial="aabbbb"
          presets={['ab', 'abb', 'aabb', 'aabbbb', 'aabbb', 'b']}
          title="One b per a, or two?"
          caption={<>Branch <M t="x" /> pops one a per b. Branch <M t="y" /> pops one a for every <em>two</em> b’s, using <M t="y_2" /> to count the pairs. Neither branch alone handles both cases, and no DPDA can.</>}
        />
        <StringQuiz spec={npdaPal} strings={['aa', 'ab', 'abba', 'aabb', 'baab', 'abaaba']} title="Even palindrome?" />
      </Section>

      <Section id="formal-definition" n={4} title="Formal definition" sub="Mathematical representation and English definition.">
        <Note kind="definition" title="nondeterministic pushdown automaton">
          <MB t="P = (Q,\ \Sigma,\ \Gamma,\ \delta,\ q_0,\ F), \qquad \delta : Q \times \Sigma_\varepsilon \times \Gamma_\varepsilon \to \mathcal{P}(Q \times \Gamma^*)" />
          <p>
            <M t="P" /> accepts <M t="w" /> if <M t="w = y_1 \cdots y_m" /> with <M t="y_i \in \Sigma_\varepsilon" />, and there are states <M t="r_0, \dots, r_m" /> and stacks <M t="s_0, \dots, s_m" /> with <M t="r_0 = q_0" />, <M t="s_0 = \varepsilon" />, <M t="r_m \in F" />, and each step <M t="(r_{i+1}, \gamma) \in \delta(r_i, y_{i+1}, X)" /> where <M t="s_i = Xt" /> and <M t="s_{i+1} = \gamma t" />.
          </p>
        </Note>
        <p>
          <strong>In plain English:</strong> the same machine as a DPDA, but with no restriction on how many moves apply at once. It accepts if <em>some</em> sequence of moves reads all of the input and ends in an accepting state.
        </p>
        <h3>Final state vs. empty stack</h3>
        <p>Some books accept when the stack becomes <strong>empty</strong> instead of in a final state. For NPDAs the two are equivalent:</p>
        <ul>
          <li><em>final state → empty stack</em>: from each accepting state, add ε-moves to a drain state that pops everything;</li>
          <li><em>empty stack → final state</em>: push a fresh bottom marker first; when it is exposed, jump to a new accepting state.</li>
        </ul>
        <p>(For DPDAs they are <em>not</em> equivalent: empty-stack DPDAs recognise only prefix-free languages.)</p>
      </Section>

      <Section id="corresponding-language" n={5} title="Corresponding language" sub="What language can it recognise?">
        <Note kind="theorem" title="CFG ⇔ NPDA">
          <p>A language is <strong>context-free</strong> if and only if some nondeterministic pushdown automaton recognises it.</p>
        </Note>
        <p>
          <strong>Grammar → machine.</strong> Put the start symbol on the stack. When the top is a <em>variable</em>, guess a rule and replace it by the rule’s right-hand side. When the top is a <em>terminal</em>, it must match the next input symbol. Accept when the stack is empty. The stack always holds the part of the sentence still to be produced. Here is that machine for <M t="S \to aSb \mid \varepsilon" />:
        </p>
        <PDASim
          spec={npdaFromGrammar}
          initial="aabb"
          presets={['', 'ab', 'aabb', 'aab', 'abab']}
          view="branch"
          title="A grammar, compiled into a machine"
          caption={<>Expansion moves <code className="inline-code">ε, S → aSb</code> guess the derivation; matching moves <code className="inline-code">a, a → ε</code> check it against the input. The accepting branch spells out a leftmost derivation.</>}
        />
        <p>
          <strong>Machine → grammar</strong> (sketch). Normalise the PDA so that each move pushes or pops exactly one symbol. Create a variable <M t="A_{pq}" /> for each pair of states, generating the strings that take the PDA from <M t="p" /> with an empty stack to <M t="q" /> with an empty stack. The first push is popped either at the very end (<M t="A_{pq} \to a\,A_{rs}\,b" />) or somewhere in the middle (<M t="A_{pq} \to A_{pr}A_{rq}" />).
        </p>
        <Table>
          <thead><tr><th>Closure of CFLs</th><th>Closed?</th><th>Reason</th></tr></thead>
          <tbody>
            <tr><td>Union, concatenation, star</td><td className="yes">yes</td><td><M t="S \to S_1 \mid S_2" />, <M t="S \to S_1S_2" />, <M t="S \to SS_1 \mid \varepsilon" /></td></tr>
            <tr><td>Intersection with a regular language</td><td className="yes">yes</td><td>run the PDA and a DFA in parallel; still one stack</td></tr>
            <tr><td>Intersection</td><td className="no">no</td><td><M t="\{a^nb^nc^m\} \cap \{a^mb^nc^n\} = \{a^nb^nc^n\}" /></td></tr>
            <tr><td>Complement</td><td className="no">no</td><td>otherwise intersection would follow by De Morgan</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section id="grammar-connection" n={6} title="Grammar connection" sub="How is that language generated?">
        <p>Context-free grammars have rules <M t="A \to \gamma" />, with a single variable on the left. The variable can be rewritten regardless of its surroundings, which is what “context-free” means. Generate a palindrome yourself:</p>
        <DerivationPlayground
          rules={['S -> aSa | bSb | a | b | ε']}
          goal="abba"
          title="Grow a palindrome from the middle out"
          caption="Each rule wraps a matching pair around the middle. The NPDA does the reverse: it pushes the outer layers, guesses the middle, and peels the layers off again."
        />
        <h3>Parse trees, ambiguity and normal forms</h3>
        <ul>
          <li>A <strong>parse tree</strong> records which rule produced which part of the string. A grammar is <strong>ambiguous</strong> if some string has two different trees, as <M t="E \to E + E \mid E * E \mid a" /> does for <code>a+a*a</code>. Some CFLs are <em>inherently</em> ambiguous: every grammar for them is ambiguous.</li>
          <li><strong>Chomsky Normal Form</strong> (<M t="A \to BC" />, <M t="A \to a" />) exists for every CFL. Its parse trees are binary, which powers the <strong>CYK algorithm</strong>: dynamic programming over substrings that decides membership in <M t="O(n^3)" />.</li>
        </ul>
      </Section>

      <Section id="limitations" n={7} title="Limitations" sub="What can this machine NOT recognise?">
        <Note kind="intuition" title="one stack matches one thing">
          <p>To check <M t="a^nb^nc^n" />, a PDA pushes the a’s and pops them against the b’s. By the time the c’s arrive, the count is gone. One stack can verify one matching, not two, and not crossing ones like <M t="ww" />.</p>
        </Note>
        <Note kind="theorem" title="pumping lemma for context-free languages">
          <p>If <M t="L" /> is context-free, there is a <M t="p" /> such that every <M t="s \in L" /> with <M t="|s| \ge p" /> splits as <M t="s = uvxyz" /> with <M t="|vxy| \le p" />, <M t="|vy| \ge 1" /> and <M t="uv^ixy^iz \in L" /> for all <M t="i \ge 0" />.</p>
        </Note>
        <p>
          The reason: a long string needs a tall parse tree, and a tall tree repeats some variable along one path. The repeated subtree can be copied or removed, which pumps <em>two</em> places, <M t="v" /> and <M t="y" />, in sync. That is enough for one matching but not two. For <M t="a^pb^pc^p" />, the window <M t="vxy" /> cannot touch both the a’s and the c’s, so pumping unbalances the counts.
        </p>
        <Table>
          <thead><tr><th>Not context-free</th><th>Recognised by</th></tr></thead>
          <tbody>
            <tr><td><M t="\{a^nb^nc^n\}" /></td><td>linear bounded automaton (next chapter)</td></tr>
            <tr><td><M t="\{ww\}" /></td><td>linear bounded automaton</td></tr>
            <tr><td><M t="\{a^{n^2}\}" />, <M t="\{a^{2^n}\}" /></td><td>linear bounded automaton</td></tr>
          </tbody>
        </Table>
        <p>Some questions also become <strong>undecidable</strong> at this level: whether two CFGs generate the same language, whether a CFG is ambiguous, and whether <M t="L(G) = \Sigma^*" />. For finite automata all of these were decidable.</p>
      </Section>

      <Section id="exercises" n={8} title="Exercises" sub="Build machines and test strings.">
        <StringQuiz spec={npdaOneOrTwo} strings={['ab', 'abb', 'aabbb', 'aabbbb', 'abbb', 'aaabbb']} title="j = i or j = 2i?" />
        <Exercise n={1} level="easy" q="Design an NPDA for all palindromes over {a, b}, odd lengths included.">
          <p>Take the even-palindrome machine and add two more guess arrows from <M t="q_2" /> to <M t="q_3" />: <M t="a, \varepsilon \to \varepsilon" /> and <M t="b, \varepsilon \to \varepsilon" />. These skip a middle symbol without pushing it.</p>
        </Exercise>
        <Exercise n={2} level="medium" q="Design a PDA for strings with equally many a’s and b’s.">
          <p>Use the stack as a signed counter above ⊥. On <M t="a" />: pop a <M t="b" /> if one is on top, otherwise push <M t="a" />. On <M t="b" /> do the reverse. Accept when ⊥ is on top at the end (an ε-move on ⊥ to an accepting state).</p>
        </Exercise>
        <Exercise n={3} level="medium" q={<>Use closure properties to show <M t="\{w \in \{a,b,c\}^* : |w|_a = |w|_b = |w|_c\}" /> is not context-free.</>}>
          <p>Intersect with the regular language <M t="a^*b^*c^*" /> to get <M t="\{a^nb^nc^n\}" />. If the original were context-free, the intersection would be too. It is not.</p>
        </Exercise>
        <Exercise n={4} level="hard" q={<>Prove <M t="\{ww : w \in \{0,1\}^*\}" /> is not context-free.</>}>
          <p>Choose <M t="s = 0^p1^p0^p1^p" />. If <M t="vxy" /> straddles the middle, it lies within <M t="1^p0^p" />, and pumping down gives <M t="0^p1^j0^k1^p" /> with <M t="j \lt p" /> or <M t="k \lt p" />, which is not of the form <M t="ww" />. If it lies within one half, pumping up shifts the midpoint so that the second half starts with 1 (or the first half ends with 0) while the other half does not. Either way the result is not in the language.</p>
        </Exercise>
      </Section>
    </ChapterShell>
  );
}
