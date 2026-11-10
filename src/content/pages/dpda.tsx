import Link from 'next/link';
import { ChapterShell } from '@/components/content/ChapterShell';
import { Note, Section, Table } from '@/components/content/Blocks';
import { M, MB } from '@/components/content/Math';
import { Exercise } from '@/components/content/Exercise';
import { PDASim } from '@/components/machines/PDASim';
import { StringQuiz } from '@/components/widgets/StringQuiz';
import { ParserDemo } from '@/components/widgets/ParserDemo';
import { DerivationPlayground } from '@/components/widgets/DerivationPlayground';
import { dpda0n1n, dpdaBrackets, dpdaWcw } from '@/content/specs';

export default function DPDA() {
  return (
    <ChapterShell
      slug="dpda"
      lede="Give a finite automaton a stack (unbounded memory that you can only use at the top) and it can match nested structure. Make it deterministic and you have the machine inside every practical parser."
      chips={[{ text: 'Deterministic context-free', tone: 'ochre' }, { text: 'Deterministic', tone: 'teal' }, { text: '50 min' }]}
    >
      <Section id="intuition" n={1} title="Intuition" sub="What problem does this machine solve?">
        <p>
          Finite automata cannot count, so they cannot match brackets, <code>begin</code>/<code>end</code> pairs, or expressions inside expressions. All of these share one shape: <strong>nesting</strong>. Whatever was opened most recently must be closed first.
        </p>
        <Note kind="intuition" title="a stack of plates">
          <p>To check <M t="0^n1^n" />, put a plate on the stack for every 0 and take one off for every 1. Run out of plates too early, or have plates left at the end, and you reject. The stack can grow without limit, but you can only see the top plate.</p>
          <p>That is exactly the memory nesting needs, and it is why your CPU keeps a <em>call stack</em> for nested function calls.</p>
        </Note>
        <p>A <strong>deterministic</strong> pushdown automaton never has to guess: at every moment at most one move applies. That makes it fast and predictable, so it is the model behind real parsers.</p>
      </Section>

      <Section id="visual-machine" n={2} title="Visual machine" sub="Interactive states, transitions and inputs.">
        <PDASim
          spec={dpda0n1n}
          initial="000111"
          presets={['', '01', '0011', '000111', '00111', '0101']}
          tag="Interactive"
          title="Deterministic PDA for 0ⁿ1ⁿ"
          caption={<>A label <code className="inline-code">a, X → Y</code> means: read <M t="a" />, pop <M t="X" /> from the top, push <M t="Y" />. ε means “nothing”. The machine first pushes the bottom marker ⊥ so that it can tell when the stack is empty.</>}
        />
        <div className="explain">
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--ink)' }} />Finite control</b>The states and arrows, just as in a DFA.</div>
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--ochre)' }} />Stack</b>Unbounded memory. Only the top plate is visible; push and pop happen there.</div>
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--ink-2)' }} />Bottom marker ⊥</b>Pushed first. Seeing ⊥ on top means “the stack is otherwise empty”.</div>
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--clay)' }} />Transition</b>Depends on the state, the input symbol (or ε) and the top of the stack.</div>
        </div>
      </Section>

      <Section id="execution" n={3} title="Execution" sub="Trace how input moves through the machine.">
        <p>A PDA’s situation is captured by a <strong>configuration</strong>: (state, input still unread, stack contents with the top first). One move is written <M t="\vdash" />. Accepting <code>0011</code>:</p>
        <Table>
          <thead><tr><th>Step</th><th>Configuration</th><th>Transition used</th></tr></thead>
          <tbody>
            <tr><td>0</td><td><M t="(q_1,\ 0011,\ \varepsilon)" /></td><td>—</td></tr>
            <tr><td>1</td><td><M t="(q_2,\ 0011,\ \bot)" /></td><td><M t="\varepsilon, \varepsilon \to \bot" /></td></tr>
            <tr><td>2</td><td><M t="(q_2,\ 011,\ 0\bot)" /></td><td><M t="0, \varepsilon \to 0" /></td></tr>
            <tr><td>3</td><td><M t="(q_2,\ 11,\ 00\bot)" /></td><td><M t="0, \varepsilon \to 0" /></td></tr>
            <tr><td>4</td><td><M t="(q_3,\ 1,\ 0\bot)" /></td><td><M t="1, 0 \to \varepsilon" /></td></tr>
            <tr><td>5</td><td><M t="(q_3,\ \varepsilon,\ \bot)" /></td><td><M t="1, 0 \to \varepsilon" /></td></tr>
            <tr><td>6</td><td><M t="(q_4,\ \varepsilon,\ \varepsilon)" /> ✓</td><td><M t="\varepsilon, \bot \to \varepsilon" /></td></tr>
          </tbody>
        </Table>
        <p>Balanced brackets need a little more care to stay deterministic. After each <code>)</code>, state <M t="q_2" /> peeks at the top to decide whether anything is still open:</p>
        <PDASim
          spec={dpdaBrackets}
          initial="(()())"
          presets={['()', '(())', '()(())', '(()', '())(']}
          title="Balanced brackets, deterministically"
          caption={<><M t="q_0" /> means “everything is matched” and is the only accepting state. Every move is forced: no two rules ever apply at the same time.</>}
        />
      </Section>

      <Section id="formal-definition" n={4} title="Formal definition" sub="Mathematical representation and English definition.">
        <Note kind="definition" title="pushdown automaton">
          <MB t="P = (Q,\ \Sigma,\ \Gamma,\ \delta,\ q_0,\ F), \qquad \delta : Q \times \Sigma_\varepsilon \times \Gamma_\varepsilon \to \mathcal{P}(Q \times \Gamma^*)" />
          <p><M t="\Gamma" /> is the <strong>stack alphabet</strong>. A move <M t="(r, \gamma) \in \delta(q, a, X)" /> reads <M t="a" />, pops <M t="X" />, pushes <M t="\gamma" /> and goes to <M t="r" />.</p>
        </Note>
        <Note kind="definition" title="deterministic">
          <p><M t="P" /> is <strong>deterministic</strong> if, for every state <M t="q" />, symbol <M t="a" /> and stack top <M t="X" />, at most one of</p>
          <MB t="\delta(q, a, X),\quad \delta(q, a, \varepsilon),\quad \delta(q, \varepsilon, X),\quad \delta(q, \varepsilon, \varepsilon)" />
          <p>is non-empty, and it contains at most one move.</p>
        </Note>
        <p>
          <strong>In plain English:</strong> a DPDA is a DFA with a stack. Each move may depend on the state, the next input symbol (or none) and the top of the stack, and in every situation at most one move is allowed, including ε-moves. It accepts if it reads the whole input and ends in an accepting state.
        </p>
        <Note kind="pitfall" title="ε-moves can hide guesses">
          <p>A rule <M t="\varepsilon, \varepsilon \to \dots" /> applies whatever the input and stack are. If the same state also has a reading rule, the machine has a choice and is no longer deterministic. That is why the bracket machine uses a separate checking state <M t="q_2" />.</p>
        </Note>
      </Section>

      <Section id="corresponding-language" n={5} title="Corresponding language" sub="What language can it recognise?">
        <Note kind="theorem" title="deterministic context-free languages">
          <p>DPDAs recognise the <strong>deterministic context-free languages</strong> (DCFLs), a proper subset of the context-free languages. DCFLs are closed under <strong>complement</strong> (unlike general CFLs), are never inherently ambiguous, and can be parsed in linear time.</p>
        </Note>
        <p>Even palindromes need a guess (where is the middle?), but if the middle is marked, a DPDA can do it. Here is <M t="\{w\,c\,w^R : w \in \{a,b\}^*\}" />:</p>
        <PDASim spec={dpdaWcw} initial="abcba" presets={['c', 'abcba', 'abbcbba', 'abcab']} title="Marked palindromes w c wᴿ"
          caption="Push until c, then pop and match. The c tells the machine exactly when to switch, so no guessing is needed." />
        <h3>Where you meet DPDAs every day: parsers</h3>
        <p>
          Programming languages are designed so that their syntax is deterministic context-free. That lets parsers run as DPDAs in linear time. The parser below is an <strong>LL(1) parser</strong>: a DPDA whose stack holds “what I still expect to see”. Step through it and watch each component work:
        </p>
        <ParserDemo />
      </Section>

      <Section id="grammar-connection" n={6} title="Grammar connection" sub="How is that language generated?">
        <p>
          DCFLs are exactly the languages of <strong>LR(k) grammars</strong>: context-free grammars that a bottom-up parser can handle deterministically with <M t="k" /> symbols of lookahead (LR(1) already suffices). Parser generators such as yacc, bison and ANTLR take a grammar like the one below and produce the DPDA for you.
        </p>
        <MB t="E \to T + E \mid T \qquad T \to F * T \mid F \qquad F \to (E) \mid a" />
        <p>Each variable is one precedence level, which makes the grammar unambiguous: <code>*</code> always sits deeper in the tree than <code>+</code>.</p>
        <DerivationPlayground
          rules={['E -> T+E | T', 'T -> F*T | F', 'F -> (E) | a']}
          start="E"
          goal="a+a*a"
          title="Derive a+a*a and look at the tree"
          caption="However you choose, the multiplication ends up lower in the tree, so it is evaluated first. Grammar structure is meaning."
        />
        <p>
          The <Link href="/learn/npda">next chapter</Link> shows that <em>every</em> context-free grammar has a pushdown automaton. Only some of those automata can be made deterministic.
        </p>
      </Section>

      <Section id="limitations" n={7} title="Limitations" sub="What can this machine NOT recognise?">
        <Table>
          <thead><tr><th>Language</th><th>DPDA?</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td><M t="\{ww^R\}" /> (even palindromes)</td><td className="no">no</td><td>It cannot know where the middle is without guessing.</td></tr>
            <tr><td><M t="\{a^nb^n\} \cup \{a^nb^{2n}\}" /></td><td className="no">no</td><td>After <M t="a^nb^n" /> it must both accept and keep the count for more b’s.</td></tr>
            <tr><td><M t="\{a^nb^nc^n\}" /></td><td className="no">no</td><td>Not context-free at all: one stack checks one match, not two.</td></tr>
          </tbody>
        </Table>
        <Note kind="theorem" title="DCFL ⊊ CFL">
          <p>Some context-free languages have no DPDA. Unlike finite automata, here <strong>nondeterminism adds power</strong>. You cannot run a subset construction on a PDA, because different branches have different stacks and there are infinitely many possible stacks.</p>
        </Note>
        <p>DCFLs are also <strong>not closed under union</strong>: <M t="\{a^nb^n\}" /> and <M t="\{a^nb^{2n}\}" /> are both deterministic, but their union is not.</p>
      </Section>

      <Section id="exercises" n={8} title="Exercises" sub="Build machines and test strings.">
        <StringQuiz spec={dpdaBrackets} strings={['', '()', ')(', '(()())', '(()', '()())']} title="Balanced?" />
        <Exercise n={1} level="easy" q={<>Design a DPDA for <M t="\{a^nb^{2n} : n \ge 0\}" />.</>}>
          <p>For each <M t="a" />, push <em>two</em> symbols (<M t="a, \varepsilon \to XX" />). For each <M t="b" />, pop one. Accept when ⊥ is on top after the input. Every move is forced.</p>
        </Exercise>
        <Exercise n={2} level="medium" q={<>Trace the <M t="w\,c\,w^R" /> machine on <code>abcba</code>, listing configurations.</>}>
          <p><M t="(q_1, abcba, \varepsilon) \vdash (q_2, abcba, \bot) \vdash (q_2, bcba, a\bot) \vdash (q_2, cba, ba\bot) \vdash (q_3, ba, ba\bot) \vdash (q_3, a, a\bot) \vdash (q_3, \varepsilon, \bot) \vdash (q_4, \varepsilon, \varepsilon)" />.</p>
        </Exercise>
        <Exercise n={3} level="medium" q="Why are programming languages designed to be deterministic context-free rather than just context-free?">
          <p>DCFLs can be parsed in linear time with a stack and a lookup table, with no backtracking and no ambiguity. General CFLs need cubic-time algorithms such as CYK or Earley in the worst case, and may be ambiguous, which would give a program two meanings.</p>
        </Exercise>
        <Exercise n={4} level="hard" q="Show that the complement of a DCFL is a DCFL (sketch).">
          <p>Make the DPDA total (add a dead state, so it always reads the whole input) and prevent infinite ε-loops. Then swap accepting and non-accepting states, taking care with ε-moves taken after the last symbol: the machine accepts if <em>any</em> configuration in that final ε-sequence is accepting. Because it is deterministic, there is only one such sequence.</p>
        </Exercise>
      </Section>
    </ChapterShell>
  );
}
