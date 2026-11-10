import { ChapterShell } from '@/components/content/ChapterShell';
import { Note, Section, Table } from '@/components/content/Blocks';
import { M, MB } from '@/components/content/Math';
import { Exercise } from '@/components/content/Exercise';
import { TMSim } from '@/components/machines/TMSim';
import { StringQuiz } from '@/components/widgets/StringQuiz';
import { tm0n1n, tmIncrement, tmLooper } from '@/content/specs';

export default function DTM() {
  return (
    <ChapterShell
      slug="dtm"
      lede="Remove the fences. A finite rulebook with an endless tape it can read and rewrite captures every algorithm anyone has ever written, and it is the first machine whose behaviour we cannot always predict."
      chips={[{ text: 'Type 0 · Recursively enumerable', tone: 'clay' }, { text: 'Deterministic', tone: 'teal' }, { text: '55 min' }]}
    >
      <Section id="intuition" n={1} title="Intuition" sub="What problem does this machine solve?">
        <p>
          In 1936 Alan Turing asked: what can a human “computer” (a clerk following rules with pencil and paper) do in principle? The clerk sees one square of paper at a time, is in one of finitely many states of mind, and follows rules like <em>“in state q, seeing a: write b, move left, switch to state r”</em>. Give them unlimited paper and nothing else.
        </p>
        <Note kind="intuition" title="the finite control and the infinite memory">
          <p>Like a CPU, a Turing machine splits into a <strong>tiny finite control</strong> (the rulebook) and a <strong>large memory</strong> (the tape). Unlike a PDA it can move anywhere on its memory and overwrite it. Those two freedoms are all it takes to compute anything that is computable.</p>
        </Note>
      </Section>

      <Section id="visual-machine" n={2} title="Visual machine" sub="Interactive states, transitions and inputs.">
        <p>Turing machines also <em>compute</em>: whatever is on the tape when they halt is the output. This one adds 1 to a binary number:</p>
        <TMSim
          spec={tmIncrement}
          initial="1011"
          presets={['0', '1011', '111', '1000']}
          speed={380}
          tag="Interactive"
          title="Binary increment"
          caption={<>Walk to the right end, then turn trailing 1s into 0s (the carry) until a 0 or a blank absorbs it. <code className="inline-code">1011</code> becomes <code className="inline-code">1100</code>. A label <code className="inline-code">1→0,L</code> means read 1, write 0, move left; <code className="inline-code">0,1→R</code> means leave 0 or 1 unchanged and move right.</>}
        />
        <div className="explain">
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--ink)' }} />Tape</b>Infinite to the right (and here to the left too), initially holding the input followed by blanks ␣.</div>
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--clay)' }} />Head</b>Reads one cell, writes one symbol, moves one step: L or R.</div>
          <div className="explain-item"><b><span className="dot" style={{ background: 'var(--moss)' }} />Halting states</b><M t="q_\text{acc}" /> and <M t="q_\text{rej}" />. The machine stops only when it reaches one of them, or has no move.</div>
        </div>
      </Section>

      <Section id="execution" n={3} title="Execution" sub="Trace how input moves through the machine.">
        <p>This machine <em>decides</em> <M t="\{0^n1^n\}" /> by zig-zagging: cross off the leftmost 0 (write <code>x</code>), run right to the leftmost 1 (write <code>y</code>), run back, repeat. When no 0s remain, check that no 1s remain either.</p>
        <TMSim
          spec={tm0n1n}
          initial="0011"
          presets={['', '01', '0011', '000111', '001', '011', '0101']}
          speed={260}
          title="Deciding 0ⁿ1ⁿ by crossing off"
          caption={<><M t="q_0" />: mark a 0. <M t="q_1" />: run right to the first 1 and mark it. <M t="q_2" />: run back to the last x. <M t="q_3" />: all 0s are used, so check that only y’s remain. Missing transitions mean “halt and reject”.</>}
        />
        <p>Each configuration is written <M t="u\,q\,v" />: the tape holds <M t="uv" />, the state is <M t="q" />, and the head is on the first symbol of <M t="v" />. On input <code>01</code>:</p>
        <MB t="q_0\,01 \;\vdash\; x\,q_1\,1 \;\vdash\; q_2\,xy \;\vdash\; x\,q_0\,y \;\vdash\; xy\,q_3\,\sqcup  \;\vdash\; xy\sqcup \,q_\text{acc}" />
        <p>
          The same idea handles <M t="0^n1^n2^n" />, which is not context-free, so Turing machines are strictly more powerful than PDAs. Notice the cost, though: about <M t="n^2" /> steps, because each round walks across the input. Running time is the subject of complexity theory.
        </p>
      </Section>

      <Section id="formal-definition" n={4} title="Formal definition" sub="Mathematical representation and English definition.">
        <Note kind="definition" title="Turing machine">
          <MB t="M = (Q,\ \Sigma,\ \Gamma,\ \delta,\ q_0,\ q_\text{acc},\ q_\text{rej}), \qquad \delta : Q \times \Gamma \to Q \times \Gamma \times \{L, R\}" />
          <ul>
            <li><M t="\Sigma" /> is the input alphabet, which does not contain the blank <M t="\sqcup " />;</li>
            <li><M t="\Gamma \supseteq \Sigma \cup \{\sqcup \}" /> is the tape alphabet;</li>
            <li><M t="q_\text{acc} \ne q_\text{rej}" /> are the halting states.</li>
          </ul>
        </Note>
        <p>
          <strong>In plain English:</strong> a finite set of states plus a rule that, for each state and symbol under the head, says what to write, which way to move and which state to enter. The input starts on an otherwise blank tape with the head on its first symbol.
        </p>
        <Note kind="definition" title="three outcomes">
          <p>On input <M t="w" /> a TM can <strong>accept</strong>, <strong>reject</strong> or <strong>loop forever</strong>.</p>
          <ul>
            <li><M t="M" /> <strong>recognises</strong> <M t="L" /> if it accepts exactly the strings in <M t="L" />. On other strings it may reject <em>or loop</em>.</li>
            <li><M t="M" /> <strong>decides</strong> <M t="L" /> if it also halts on every input. Then <M t="L" /> is <strong>decidable</strong>.</li>
          </ul>
        </Note>
        <Table>
          <thead><tr><th>Variant</th><th>More powerful?</th><th>Simulation cost</th></tr></thead>
          <tbody>
            <tr><td>Two-way infinite tape</td><td>no</td><td>constant factor</td></tr>
            <tr><td><M t="k" /> tapes</td><td>no</td><td><M t="t" /> steps become <M t="O(t^2)" /></td></tr>
            <tr><td>Random-access memory</td><td>no</td><td>polynomial</td></tr>
            <tr><td>PDA with two stacks</td><td>no</td><td>the two stacks are the tape left and right of the head</td></tr>
            <tr><td>Nondeterminism (next chapter)</td><td>no</td><td>possibly exponential</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section id="corresponding-language" n={5} title="Corresponding language" sub="What language can it recognise?">
        <Note kind="theorem" title="recursively enumerable languages">
          <p>The languages recognised by Turing machines are the <strong>recursively enumerable</strong> (Turing-recognisable) languages, Type 0. The languages <em>decided</em> by Turing machines are the <strong>decidable</strong> (recursive) languages, a proper subset.</p>
        </Note>
        <Note kind="theorem" title="the Church–Turing thesis">
          <p>Every function that can be computed by an effective, step-by-step procedure can be computed by a Turing machine.</p>
        </Note>
        <p>
          This is a thesis rather than a theorem, because “effective procedure” is not a mathematical notion. The evidence is overwhelming: λ-calculus, recursive functions, register machines, cellular automata and every programming language compute exactly the same functions. Systems with this power are called <strong>Turing-complete</strong>.
        </p>
        <p>
          <strong>Machines as data.</strong> A TM is a finite object, so it can be written as a string <M t="\langle M \rangle" />. A <strong>universal Turing machine</strong> <M t="U" /> takes <M t="\langle M, w\rangle" /> and simulates <M t="M" /> on <M t="w" />. It is the stored-program computer, described a decade before anyone built one. Every interpreter and virtual machine is a universal machine.
        </p>
      </Section>

      <Section id="grammar-connection" n={6} title="Grammar connection" sub="How is that language generated?">
        <p>
          <strong>Unrestricted grammars</strong> allow any rule <M t="\alpha \to \beta" /> where <M t="\alpha" /> contains at least one variable. Strings may grow and shrink freely.
        </p>
        <Note kind="theorem">
          <p>A language is generated by an unrestricted grammar if and only if it is Turing-recognisable.</p>
        </Note>
        <ul>
          <li><strong>Grammar → TM</strong>: search through all derivations breadth-first and accept when <M t="w" /> appears.</li>
          <li><strong>TM → grammar</strong>: a TM step only rewrites a few neighbouring tape cells, for example <M t="q\,a \to b\,r" /> for a right move. So the grammar generates a guessed accepting configuration and rewrites it, step by step, back to the start configuration on <M t="w" />.</li>
        </ul>
        <p>Allowing rules to <em>shrink</em> strings is exactly what separates Type 0 from Type 1, and unbounded memory from linear memory.</p>
      </Section>

      <Section id="limitations" n={7} title="Limitations" sub="What can this machine NOT recognise?">
        <p>Turing machines can run every algorithm, yet some precise questions have <strong>no algorithm at all</strong>. The most famous:</p>
        <Note kind="theorem" title="the Halting Problem is undecidable (Turing, 1936)">
          <MB t="\textit{HALT} = \{\langle M, w\rangle : M \text{ halts on input } w\}" />
          <p>is not decidable: no Turing machine answers it correctly for every <M t="\langle M, w\rangle" />.</p>
        </Note>
        <Note kind="intuition" title="the program that does the opposite">
          <p>Suppose <code>halts(P, x)</code> always answered correctly. Write:</p>
          <pre><code>{`def paradox(P):
    if halts(P, P): loop_forever()
    else: return`}</code></pre>
          <p>Does <code>paradox(paradox)</code> halt? If <code>halts</code> says yes, it loops; if it says no, it halts. Either way <code>halts</code> was wrong, so it cannot exist. This is <strong>diagonalisation</strong>.</p>
        </Note>
        <p>You can watch the problem directly. This machine halts on strings of 0s, but as soon as it reads a 1 it runs right forever. A simulator can only give up after a step budget, never prove the loop in general:</p>
        <TMSim spec={tmLooper} initial="001" presets={['000', '001', '1']} speed={120} title="A machine that sometimes never stops" />
        <ul>
          <li><strong>Rice’s theorem</strong>: every non-trivial question about the <em>language</em> of a program (does it accept anything, is it equivalent to another program, is it a virus) is undecidable.</li>
          <li>The complement of <em>HALT</em> is not even recognisable: there is no finite evidence that a program runs forever.</li>
          <li>Most languages are not recognisable at all. There are countably many TMs but uncountably many languages.</li>
        </ul>
      </Section>

      <Section id="exercises" n={8} title="Exercises" sub="Build machines and test strings.">
        <StringQuiz spec={tm0n1n} strings={['', '01', '10', '0011', '0010', '000111']} title="Does the 0ⁿ1ⁿ machine accept?" />
        <Exercise n={1} level="easy" q="Show that decidable languages are closed under complement, and recognisable ones under union.">
          <p>Complement: run the decider and swap accept and reject; it always halts. Union of recognisable languages: run both machines <em>in parallel</em>, alternating steps, and accept as soon as either accepts. Running them one after the other fails if the first loops.</p>
        </Exercise>
        <Exercise n={2} level="medium" q="Modify the increment machine so that it decrements (assume the input is positive).">
          <p>Same shape with the roles of 0 and 1 swapped: walk to the end, then turn trailing 0s into 1s moving left (the borrow), and when a 1 is found turn it into 0 and halt.</p>
        </Exercise>
        <Exercise n={3} level="medium" q="Why does a TM that can only move right (never left) recognise only regular languages?">
          <p>Moving only right, it reads each input cell once and never revisits anything it wrote. Once past the input it sees only blanks, so its future depends only on its state. It is a finite automaton in disguise.</p>
        </Exercise>
        <Exercise n={4} level="hard" q="Prove: L is decidable if and only if both L and its complement are recognisable.">
          <p>(⇒) A decider is a recogniser, and swapping its answers recognises the complement. (⇐) Run recognisers for <M t="L" /> and <M t="\overline{L}" /> in parallel. Every string is in exactly one of them, so exactly one eventually accepts; answer accordingly. This always halts.</p>
        </Exercise>
      </Section>
    </ChapterShell>
  );
}
