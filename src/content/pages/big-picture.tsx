import Link from 'next/link';
import { ChapterShell } from '@/components/content/ChapterShell';
import { Note, Section, Table } from '@/components/content/Blocks';
import { M } from '@/components/content/Math';
import { ChomskyExplorer } from '@/components/widgets/ChomskyExplorer';

export default function BigPicture() {
  return (
    <ChapterShell
      slug="big-picture"
      lede="All four machines side by side: what each one recognises, where guessing helps, which questions about them can be answered, and where to go next."
      chips={[{ text: 'Summary', tone: 'moss' }, { text: '20 min' }]}
    >
      <Section id="hierarchy-map" n={1} title="The hierarchy, assembled">
        <ChomskyExplorer />
        <Table>
          <thead><tr><th>Type</th><th>Languages</th><th>Grammar rules</th><th>Machine</th><th>Memory</th><th>Example just outside</th></tr></thead>
          <tbody>
            <tr><td>3</td><td>Regular</td><td><M t="A \to aB \mid a \mid \varepsilon" /></td><td><Link href="/learn/dfa">DFA</Link> = <Link href="/learn/nfa">NFA</Link></td><td>finite</td><td><M t="a^nb^n" /></td></tr>
            <tr><td>—</td><td>Deterministic CF</td><td>LR(k)</td><td><Link href="/learn/dpda">DPDA</Link></td><td>stack</td><td><M t="ww^R" /></td></tr>
            <tr><td>2</td><td>Context-free</td><td><M t="A \to \gamma" /></td><td><Link href="/learn/npda">NPDA</Link></td><td>stack</td><td><M t="a^nb^nc^n" /></td></tr>
            <tr><td>1</td><td>Context-sensitive</td><td><M t="|\alpha| \le |\beta|" /></td><td><Link href="/learn/lba">LBA</Link></td><td>linear tape</td><td>(by diagonalisation)</td></tr>
            <tr><td>—</td><td>Decidable</td><td>—</td><td>TM that always halts</td><td>unbounded tape</td><td>HALT</td></tr>
            <tr><td>0</td><td>Recursively enumerable</td><td><M t="\alpha \to \beta" /></td><td><Link href="/learn/dtm">DTM</Link> = <Link href="/learn/ntm">NTM</Link></td><td>unbounded tape</td><td><M t="\overline{\textit{HALT}}" /></td></tr>
          </tbody>
        </Table>
        <p>Every inclusion is strict: <M t="\text{REG} \subsetneq \text{DCFL} \subsetneq \text{CFL} \subsetneq \text{CSL} \subsetneq \text{DEC} \subsetneq \text{RE}" />.</p>
      </Section>

      <Section id="determinism-compared" n={2} title="Determinism, compared">
        <Table>
          <thead><tr><th>Family</th><th>Deterministic</th><th>Nondeterministic</th><th>Same power?</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td>Finite</td><td>DFA</td><td>NFA</td><td className="yes">yes</td><td>subset construction (up to <M t="2^n" /> states)</td></tr>
            <tr><td>Pushdown</td><td>DPDA</td><td>NPDA</td><td className="no">no</td><td>branches have different stacks; <M t="ww^R" /> needs a guess</td></tr>
            <tr><td>Linear bounded</td><td>DLBA</td><td>LBA</td><td>open</td><td>the first LBA problem, open since 1964</td></tr>
            <tr><td>Turing</td><td>DTM</td><td>NTM</td><td className="yes">yes</td><td>breadth-first simulation, possibly exponentially slower: P vs NP</td></tr>
          </tbody>
        </Table>
        <Note kind="intuition">
          <p>Nondeterminism never adds power when the deterministic machine can afford to <em>remember all branches at once</em>. A DFA can store a set of states; a DTM can store a whole search tree on its tape. A DPDA cannot: it would need one stack per branch.</p>
        </Note>
      </Section>

      <Section id="decidability" n={3} title="What can be decided">
        <p>The more powerful the machine, the fewer questions about it have algorithmic answers:</p>
        <Table>
          <thead><tr><th>Question</th><th className="c">Finite</th><th className="c">Pushdown</th><th className="c">LBA</th><th className="c">Turing</th></tr></thead>
          <tbody>
            <tr><td>Does it accept <M t="w" />?</td><td className="c yes">✓</td><td className="c yes">✓</td><td className="c yes">✓</td><td className="c no">✗</td></tr>
            <tr><td>Does it accept anything?</td><td className="c yes">✓</td><td className="c yes">✓</td><td className="c no">✗</td><td className="c no">✗</td></tr>
            <tr><td>Do two machines agree?</td><td className="c yes">✓</td><td className="c no">✗ (✓ for DPDAs)</td><td className="c no">✗</td><td className="c no">✗</td></tr>
            <tr><td>Does it accept everything?</td><td className="c yes">✓</td><td className="c no">✗</td><td className="c no">✗</td><td className="c no">✗</td></tr>
          </tbody>
        </Table>
        <Note kind="intuition" title="the principle of least power">
          <p>Choose the weakest formalism that does the job. A regular expression can be analysed, minimised and compared; an arbitrary program cannot. This is why configuration languages, validators and query languages are often deliberately <em>not</em> Turing-complete.</p>
        </Note>
      </Section>

      <Section id="complexity" n={4} title="A glimpse of complexity">
        <p>Decidable is not the same as feasible. Complexity theory measures the resources a decidable problem needs:</p>
        <ul>
          <li><M t="\mathbf{P}" />: polynomial time on a DTM. Examples: sorting, shortest paths, and parsing any context-free language (CYK runs in <M t="O(n^3)" />).</li>
          <li><M t="\mathbf{NP}" />: polynomial time on an NTM, or equivalently quickly checkable certificates. Examples: SAT, Sudoku, scheduling.</li>
          <li><M t="\mathbf{PSPACE}" />: polynomial space. It includes the membership problem for context-sensitive languages, so LBAs reappear here.</li>
        </ul>
        <p>
          It is known that <M t="\mathbf{P} \subseteq \mathbf{NP} \subseteq \mathbf{PSPACE}" />, and the hierarchy theorems show that <M t="\mathbf{P} \ne \mathbf{EXPTIME}" />. But whether <M t="\mathbf{P} = \mathbf{NP}" /> remains open.
        </p>
      </Section>

      <Section id="where-next" n={5} title="Where to go next">
        <Table>
          <thead><tr><th>Resource</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td>Michael Sipser, <em>Introduction to the Theory of Computation</em></td><td>The clearest textbook. This course follows its notation.</td></tr>
            <tr><td>Hopcroft, Motwani &amp; Ullman, <em>Automata Theory, Languages, and Computation</em></td><td>More algorithms and detail on automata and grammars.</td></tr>
            <tr><td>Dexter Kozen, <em>Automata and Computability</em></td><td>Short, elegant lectures for a second pass.</td></tr>
            <tr><td>MIT 18.404J on OpenCourseWare</td><td>Sipser’s full course as free video lectures.</td></tr>
            <tr><td>Aho, Lam, Sethi &amp; Ullman, <em>Compilers</em></td><td>Lexers and parsers in depth: the theory put to work.</td></tr>
          </tbody>
        </Table>
        <Note kind="theorem" title="you made it">
          <p>You can now design machines for each level of the hierarchy, explain what nondeterminism does at each level, connect machines to grammars, and prove what each machine cannot do. Revisit the interactive examples whenever you want a refresher. They are the fastest way to bring the intuition back.</p>
        </Note>
      </Section>
    </ChapterShell>
  );
}
