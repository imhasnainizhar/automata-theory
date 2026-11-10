import Link from 'next/link';
import { ChapterShell } from '@/components/content/ChapterShell';
import { KeyTerms, Primer } from '@/components/content/Primer';
import { Note, Section, Table } from '@/components/content/Blocks';
import { M } from '@/components/content/Math';
import { FASim } from '@/components/machines/FASim';
import { PDASim } from '@/components/machines/PDASim';
import { CpuDemo } from '@/components/widgets/CpuDemo';
import { StringQuiz } from '@/components/widgets/StringQuiz';
import { dpdaBrackets, ends01, ends01NFA, vending } from '@/content/specs';

export default function Intuition() {
  return (
    <ChapterShell
      slug="intuition"
      lede="Before any formal definitions, get a feel for how machines think. Click, step and break things: states, transitions, determinism and memory will make sense by the end."
      chips={[{ text: '30 min, hands-on', tone: 'moss' }, { text: 'CPU walkthrough', tone: 'clay' }]}
    >
      <Primer
        analogy={<>A board game: your token sits on one square (the state), you roll a die (the input), and the rules tell you which square to move to (the transition).</>}
      >
        <p>This chapter is all about getting a <em>feel</em> for machines before any formulas. You will push coins into a vending machine, watch a CPU tick through its cycle, and see what it means for a machine to “guess”.</p>
        <p>Keep one question in mind throughout: <strong>what does this machine need to remember?</strong> A vending machine only needs the money paid so far, not which coins. That “just enough memory” idea is what states are for.</p>
      </Primer>
      <KeyTerms
        terms={[
          {
            term: 'State',
            plain: 'The one thing the machine remembers right now.',
            more: <><p>Like a bookmark: it does not store the whole book, just where you are. Two different histories that need the same future behaviour can share one state.</p></>,
          },
          {
            term: 'Transition',
            plain: 'Move from one state to another when a symbol is read.',
            more: <><p>Drawn as a labelled arrow. Label <code>n</code> on an arrow from <M t="c_0" /> to <M t="c_5" /> means “with 0¢ paid, a nickel takes you to 5¢ paid”.</p></>,
          },
          {
            term: 'Dead state',
            plain: 'A trap: once you are in, you can never accept.',
            more: <><p>For example “overpaid” in the vending machine. Diagrams often leave dead states out; a missing arrow quietly means “go to the trap”.</p></>,
          },
          {
            term: 'Control unit',
            plain: 'The part of a CPU that decides what happens next.',
            more: <><p>It is a small state machine that cycles <em>Fetch → Decode → Execute</em>, sending signals to the rest of the chip. The registers and memory hold the data; the control unit holds the plan.</p></>,
          },
          {
            term: 'Register',
            plain: 'A tiny, very fast storage slot inside the CPU.',
            more: <><p>The program counter (PC) holds the address of the next instruction, the instruction register (IR) holds the current one, and the accumulator (ACC) holds working results.</p></>,
          },
          {
            term: 'Stack',
            plain: 'A pile where you can only add or remove the top item.',
            more: <><p>Like a stack of plates: <em>push</em> puts one on top, <em>pop</em> takes the top one off. It is exactly the memory needed to match nested brackets, because the most recently opened one must close first.</p></>,
          },
        ]}
      />

      <Section id="states-and-transitions" n={1} title="States & transitions">
        <p>Every automaton is built from two ideas:</p>
        <ul>
          <li>A <strong>state</strong> is a summary of everything about the past that still matters. Not the whole past, only the part that affects the future.</li>
          <li>A <strong>transition</strong> is a rule: “in this state, on this input, move to that state”.</li>
        </ul>
        <Note kind="intuition" title="a vending machine">
          <p>A machine sells a drink for 15 cents and takes nickels (<code>n</code>, 5¢) and dimes (<code>d</code>, 10¢). It does not need to remember which coins you used, only the <em>total so far</em>. So its states are 0¢, 5¢, 10¢ and 15¢, plus a “too much” state for overpaying.</p>
        </Note>
        <FASim
          spec={vending}
          initial="ndn"
          presets={['nnn', 'dn', 'nd', 'dd', 'ndn']}
          tag="Try it"
          title="15¢ vending machine"
          caption={<>Accepting means exactly 15¢ was paid. The dashed state <b>x</b> is a <b>dead state</b>: once you overpay, nothing can fix it. Note that <code>nd</code> and <code>dn</code> end in the same state, because the order does not matter, only the total.</>}
        />
      </Section>

      <Section id="reading-input" n={2} title="Reading input">
        <p>Automata read input in a very particular way: <strong>one symbol at a time, left to right, never going back</strong>. After the last symbol, the machine’s state alone decides the answer.</p>
        <p>Watch this machine decide whether a binary string <strong>ends in 01</strong>. It tracks how much of <code>01</code> it has just seen:</p>
        <FASim
          spec={ends01}
          initial="11001"
          presets={['01', '11001', '0110', '1001001']}
          title="Ends in 01"
          caption={<><M t="q_0" />: nothing useful yet. <M t="q_1" />: the input ends in 0. <M t="q_2" />: the input ends in 01. The trace below the tape records every move.</>}
        />
        <StringQuiz spec={ends01} strings={['0', '01', '101', '0101', '0110', '111101']} />
      </Section>

      <Section id="cpu-control-unit" n={3} title="A CPU is a state machine">
        <p>
          Automata are not just theory: they are inside every processor. The <strong>control unit</strong> of a CPU is a finite-state machine that cycles through <em>Fetch → Decode → Execute</em> on every clock tick, driving the rest of the chip. Step through a tiny program and watch each component do its job:
        </p>
        <CpuDemo />
        <Note kind="intuition">
          <p>
            The CPU as a whole has billions of bits of memory, but the control unit itself has only a handful of states. The finite control decides <em>what to do next</em>, and the registers and memory hold the data. Turing machines have exactly the same split: a finite control plus a big memory.
          </p>
        </Note>
      </Section>

      <Section id="determinism" n={4} title="Determinism vs. nondeterminism">
        <p>
          A machine is <strong>deterministic</strong> if it never has a choice: each state and symbol lead to exactly one next state. A <strong>nondeterministic</strong> machine may have several possible moves, or none. It accepts if <em>some</em> sequence of choices leads to acceptance.
        </p>
        <Note kind="intuition" title="three ways to picture guessing">
          <ul>
            <li><strong>Lucky guessing</strong>: the machine always picks the right branch, if a right branch exists.</li>
            <li><strong>Parallel worlds</strong>: at every choice the machine clones itself. Clones with no move die.</li>
            <li><strong>Fingers on the diagram</strong>: keep a finger on every state it could be in, and move them all at once.</li>
          </ul>
        </Note>
        <p>Here is the same language, “ends in 01”, as a nondeterministic machine. It simply <em>guesses</em> that the current <code>0</code> is the second-to-last symbol:</p>
        <FASim
          spec={ends01NFA}
          initial="11001"
          presets={['01', '11001', '0110']}
          tag="Nondeterministic"
          title="Guess where 01 starts"
          caption="Watch the set of active states: several fingers at once. The nondeterministic version is simpler to design: three arrows instead of six."
        />
        <Table>
          <thead><tr><th>Machine family</th><th>Does guessing add power?</th></tr></thead>
          <tbody>
            <tr><td>Finite automata</td><td className="no">No. Every NFA has an equivalent DFA (possibly exponentially larger).</td></tr>
            <tr><td>Pushdown automata</td><td className="yes">Yes. Some languages need guessing, such as even-length palindromes.</td></tr>
            <tr><td>Linear bounded automata</td><td>Unknown. An open problem since 1964.</td></tr>
            <tr><td>Turing machines</td><td className="no">No in power, but possibly yes in speed: that is P vs NP.</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section id="adding-memory" n={5} title="Adding memory">
        <p>
          Can any finite automaton check whether brackets are balanced? No. With <M t="k" /> states, after reading <M t="k+1" /> opening brackets two different depths must share a state, and from then on the machine cannot tell them apart. This pigeonhole argument returns in the DFA chapter as the <strong>pumping lemma</strong>.
        </p>
        <p>Give the machine a <strong>stack</strong> and the problem becomes easy:</p>
        <PDASim
          spec={dpdaBrackets}
          initial="(()())"
          presets={['()', '(())()', '(()', '())(']}
          tag="Preview"
          title="Balanced brackets with a stack"
          caption={<>Each <code>(</code> pushes a plate and each <code>)</code> pops one. The ⊥ plate marks the bottom, so the machine knows when everything is matched. You will meet this machine properly in <Link href="/learn/dpda">Deterministic Pushdown Automata</Link>.</>}
        />
        <p>That is the whole story of the course in one move: more memory, more power. Next come the four machine families, starting with the simplest.</p>
      </Section>
    </ChapterShell>
  );
}
