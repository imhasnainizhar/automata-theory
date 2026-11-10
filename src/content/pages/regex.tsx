import Link from 'next/link';
import { ChapterShell } from '@/components/content/ChapterShell';
import { Note, Section, Table } from '@/components/content/Blocks';
import { M, MB } from '@/components/content/Math';
import { Exercise } from '@/components/content/Exercise';
import { KeyTerms, Primer } from '@/components/content/Primer';
import { FASim } from '@/components/machines/FASim';
import { StateDiagram } from '@/components/machines/StateDiagram';
import { StageStepper } from '@/components/widgets/StageStepper';
import { SubsetConstruction } from '@/components/widgets/SubsetConstruction';
import { RegexTester } from '@/components/widgets/RegexTester';
import { StringQuiz } from '@/components/widgets/StringQuiz';
import {
  ends01, ends01NFA, eliminationStages, tConcat, tStar, tSymbol, tUnion, thompsonFinal, thompsonStages,
} from '@/content/specs';

function KleeneCycle() {
  return (
    <figure className="panel cycle" style={{ marginInline: 0 }}>
      <svg viewBox="0 0 620 330" role="img" aria-label="Kleene's theorem as a cycle of conversions">
        <defs>
          <marker id="kc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0,0.6 L10,5 L0,9.4 z" fill="var(--clay)" />
          </marker>
        </defs>
        <g className="node"><rect x="225" y="20" width="170" height="64" rx="18" /><text x="310" y="44">Regular expression</text><text x="310" y="66" className="sub">a pattern</text></g>
        <g className="node"><rect x="20" y="240" width="170" height="64" rx="18" /><text x="105" y="264">ε-NFA</text><text x="105" y="286" className="sub">a guessing machine</text></g>
        <g className="node"><rect x="430" y="240" width="170" height="64" rx="18" /><text x="515" y="264">DFA</text><text x="515" y="286" className="sub">a deterministic machine</text></g>
        <path className="arc" d="M235 86 C 160 120, 110 170, 105 236" markerEnd="url(#kc-a)" />
        <path className="arc" d="M196 272 H 424" markerEnd="url(#kc-a)" />
        <path className="arc" d="M515 236 C 510 170, 460 120, 386 86" markerEnd="url(#kc-a)" />
        <text className="arc-label" x="118" y="150">Thompson’s</text><text className="arc-label" x="118" y="168">construction</text>
        <text className="arc-label" x="310" y="262">ε-closure +</text><text className="arc-label" x="310" y="280">subset construction</text>
        <text className="arc-label" x="505" y="150">state</text><text className="arc-label" x="505" y="168">elimination</text>
      </svg>
      <figcaption className="panel-caption">
        <b>Kleene’s theorem as a cycle.</b> Each arrow is an algorithm. Since you can go all the way round, the three descriptions have exactly the same power: they all describe the <b>regular languages</b>.
      </figcaption>
    </figure>
  );
}

export default function Regex() {
  return (
    <ChapterShell
      slug="regex"
      lede="Three ways to describe the same patterns: deterministic machines, guessing machines, and regular expressions. This chapter shows they are interchangeable, and gives the algorithms that convert each into the others."
      chips={[{ text: 'Type 3 · Regular', tone: 'moss' }, { text: 'Conversions', tone: 'ochre' }, { text: '50 min' }]}
    >
      <Primer
        analogy={<>A recipe, a cook who follows it exactly, and a cook who sometimes tries two things at once and keeps whichever works. They can all make the same dishes. Some descriptions are just shorter or easier to write.</>}
      >
        <p>So far you have met two kinds of finite machine: the <strong>DFA</strong>, which always knows exactly what to do next, and the <strong>NFA</strong>, which is allowed to guess. You have probably also used <strong>regular expressions</strong> (patterns like <code>a*b</code>) in a text editor or a programming language.</p>
        <p>The big surprise of this chapter is that these three are <strong>equally powerful</strong>. Any pattern one of them can describe, the other two can describe as well. Better still, there are step-by-step recipes for turning each into the others. Those recipes are the heart of every regex engine and every lexer.</p>
      </Primer>
      <KeyTerms
        terms={[
          {
            term: 'Regular expression',
            plain: 'A short formula that describes a set of strings.',
            more: <><p>Built from single symbols using just three operations: <em>or</em> (<M t="\cup" />, also written <code>|</code>), <em>then</em> (writing things next to each other), and <em>repeat</em> (<M t="{}^*" />, zero or more times). For example <M t="(0 \cup 1)^*01" /> means “any mix of 0s and 1s, then 01”, which is every binary string ending in 01.</p><p>The regexes in programming languages add conveniences like <code>[a-z]</code> and <code>+</code>, which are shorthand for these three operations. Backreferences like <code>\1</code> are an exception: they go beyond regular languages.</p></>,
          },
          {
            term: 'ε (epsilon)',
            plain: 'The empty string: zero characters.',
            more: <><p>In a regex, <M t="\varepsilon" /> matches the empty string. In an NFA, an <strong>ε-move</strong> is an arrow the machine may follow <em>without reading anything</em>, like a free teleport between states.</p><p>Do not confuse it with <M t="\emptyset" />, the empty set. <M t="\varepsilon" /> is one (empty) string; <M t="\emptyset" /> contains no strings at all.</p></>,
          },
          {
            term: 'ε-closure',
            plain: 'Everywhere you can reach for free, without reading input.',
            more: <><p>The ε-closure of a state is that state plus every state reachable from it using only ε-moves, possibly several in a row. Whenever an NFA lands somewhere, it is really in the whole ε-closure of that place at once.</p><p>Every NFA-to-DFA conversion computes ε-closures first.</p></>,
          },
          {
            term: 'Subset construction',
            plain: 'Turning a guessing machine into a deterministic one.',
            more: <><p>Track the <em>set</em> of states the NFA could be in. Each such set becomes one state of the new DFA. There are finitely many subsets, so the result is still finite, though it can have up to <M t="2^n" /> states for an NFA with <M t="n" /> states.</p></>,
          },
          {
            term: 'Kleene’s theorem',
            plain: 'Regular expressions and finite automata describe exactly the same languages.',
            more: <><p>Proved by Stephen Kleene in 1956. It has two directions: every regex can be turned into an automaton (Thompson’s construction), and every automaton can be turned into a regex (state elimination). Together they show the two formalisms are equally expressive.</p></>,
          },
          {
            term: 'Thompson’s construction',
            plain: 'A Lego-like recipe that builds an NFA from a regex.',
            more: <><p>There is one tiny NFA for each symbol, and one way to glue NFAs together for each operation (or, then, repeat). You assemble them following the structure of the regex. The result has at most about twice as many states as the regex has symbols, so it is small and fast to build.</p></>,
          },
          {
            term: 'GNFA',
            plain: 'An NFA whose arrows are labelled with whole regexes, not single symbols.',
            more: <><p>A <strong>generalised NFA</strong> may read any string matching an arrow’s regex in one move. It is a temporary tool used by state elimination: you shrink the machine state by state while the arrow labels grow, until one arrow holds the answer.</p></>,
          },
          {
            term: 'State elimination',
            plain: 'Removing states one by one to read off a regex.',
            more: <><p>Pick a state, delete it, and patch every path that went through it with a regex label that says “what you could have read on the way”. Repeat until only a start and an accept state remain. The label between them is a regex for the whole machine.</p></>,
          },
        ]}
      />

      <Section id="dfa-vs-nfa" n={1} title="DFA vs. NFA, side by side" sub="Same power, different trade-offs.">
        <p>Here is one language, <em>binary strings that end in 01</em>, as both machines. Step them in parallel and compare what lights up:</p>
        <FASim spec={ends01} initial="1101" presets={['01', '1101', '0110']} tag="Deterministic" title="DFA: exactly one current state" hideTrace />
        <FASim spec={ends01NFA} initial="1101" presets={['01', '1101', '0110']} tag="Nondeterministic" title="NFA: a set of possible states" hideTrace />
        <Table>
          <thead><tr><th></th><th>DFA</th><th>NFA</th></tr></thead>
          <tbody>
            <tr><td>Moves from a state on a symbol</td><td>exactly one</td><td>zero, one, or several</td></tr>
            <tr><td>Free moves (ε)</td><td>not allowed</td><td>allowed</td></tr>
            <tr><td>Accepts when…</td><td>the single run ends in an accept state</td><td><em>some</em> run ends in an accept state</td></tr>
            <tr><td>Size for “k-th symbol from the end is 1”</td><td><M t="2^k" /> states</td><td><M t="k + 1" /> states</td></tr>
            <tr><td>Easy to design?</td><td>harder: you must plan every case</td><td>easier: guess, then check</td></tr>
            <tr><td>Fast to run?</td><td>yes: one lookup per symbol</td><td>track a set of states per symbol</td></tr>
            <tr><td>Complement</td><td>swap accept and non-accept states</td><td>convert to a DFA first</td></tr>
            <tr><td>Languages recognised</td><td colSpan={2} style={{ textAlign: 'center' }}><b>exactly the same: the regular languages</b></td></tr>
          </tbody>
        </Table>
        <Note kind="intuition" title="when to use which">
          <p>Think and <em>design</em> with NFAs (and regexes), because they are short and natural. <em>Run</em> DFAs, because they are fast and predictable. The conversion between them is an algorithm, so you never have to choose: compilers and regex engines do exactly this.</p>
        </Note>
      </Section>

      <Section id="conversions" n={2} title="Converting between machines" sub="Every arrow is an algorithm.">
        <Table>
          <thead><tr><th>From → To</th><th>Method</th><th>Size of the result</th></tr></thead>
          <tbody>
            <tr><td>DFA → NFA</td><td>Nothing to do: every DFA already is an NFA</td><td>same</td></tr>
            <tr><td>ε-NFA → NFA</td><td>ε-removal: replace each ε-path by direct arrows</td><td>same number of states</td></tr>
            <tr><td>NFA → DFA</td><td>Subset construction</td><td>up to <M t="2^n" /> states</td></tr>
            <tr><td>DFA → smallest DFA</td><td>Minimisation: merge states no input can tell apart</td><td>the unique minimum</td></tr>
            <tr><td>Regex → ε-NFA</td><td>Thompson’s construction (section v)</td><td>about <M t="2\,|R|" /> states</td></tr>
            <tr><td>NFA/DFA → Regex</td><td>State elimination (section vi)</td><td>can be exponentially long</td></tr>
          </tbody>
        </Table>
        <h3>ε-removal, in one line</h3>
        <p>For every state <M t="q" /> and symbol <M t="a" />, add an arrow <M t="q \xrightarrow{a} r" /> whenever you can get from <M t="q" /> to <M t="r" /> by “free moves, then <M t="a" />, then free moves”. Make <M t="q" /> accepting if an accepting state is reachable from it by free moves alone. Then delete the ε-arrows.</p>
        <h3>NFA → DFA: the subset construction</h3>
        <p>The DFA’s states are <em>sets</em> of NFA states. Start with the ε-closure of the NFA’s start state; for each set and each symbol, compute where all the fingers move. Step through it:</p>
        <SubsetConstruction spec={ends01NFA} alphabet={['0', '1']} />
        <p>Only 3 of the 8 possible subsets appear, and the result is the same DFA you just ran in section i. In general the construction can need all <M t="2^n" /> subsets, and for some languages that blow-up is unavoidable. See the <Link href="/learn/nfa">NFA chapter</Link> for why.</p>
      </Section>

      <Section id="regular-expressions" n={3} title="Regular expressions" sub="Patterns built from three operations.">
        <Note kind="definition" title="regular expressions over Σ">
          <p>Base cases: <M t="a" /> for each symbol <M t="a \in \Sigma" />, plus <M t="\varepsilon" /> and <M t="\emptyset" />. If <M t="R" /> and <M t="S" /> are regular expressions, so are</p>
          <MB t="(R \cup S) \qquad (RS) \qquad (R^*)" />
          <p>meaning <em>R or S</em>, <em>R then S</em>, and <em>zero or more copies of R</em>.</p>
        </Note>
        <p><strong>Reading order (precedence):</strong> star binds tightest, then concatenation, then union. So <M t="ab^* \cup c" /> means <M t="(a(b^*)) \cup c" />: an <M t="a" /> followed by any number of <M t="b" />s, or just a <M t="c" />.</p>
        <Table>
          <thead><tr><th>Regex (Σ = {'{0,1}'})</th><th>In plain words</th></tr></thead>
          <tbody>
            <tr><td><M t="0^*10^*" /></td><td>exactly one 1</td></tr>
            <tr><td><M t="(0 \cup 1)^*1(0 \cup 1)^*" /></td><td>at least one 1</td></tr>
            <tr><td><M t="((0 \cup 1)(0 \cup 1))^*" /></td><td>even length</td></tr>
            <tr><td><M t="(1 \cup 01)^*" /></td><td>every 0 is followed by a 1</td></tr>
            <tr><td><M t="(0 \cup 10)^*(\varepsilon \cup 1)" /></td><td>no two 1s in a row</td></tr>
            <tr><td><M t="1^*(01^*01^*)^*" /></td><td>an even number of 0s</td></tr>
          </tbody>
        </Table>
        <RegexTester initial="(1|01)*" tests="1, 01, 0101, 0011, 10, 11011, " />
        <Note kind="pitfall" title="common slips">
          <ul>
            <li><M t="(R \cup S)^* \ne R^* \cup S^*" />: the left side allows mixing (<M t="ab" />), the right side does not.</li>
            <li><M t="(RS)^* \ne R^*S^*" />: <M t="aab" /> is in <M t="a^*b^*" /> but not in <M t="(ab)^*" />.</li>
            <li>Concatenation does not commute: <M t="ab \ne ba" />.</li>
          </ul>
        </Note>
      </Section>

      <Section id="kleene" n={4} title="Kleene’s theorem" sub="Three formalisms, one class of languages.">
        <Note kind="theorem" title="Kleene, 1956">
          <p>For a language <M t="L" />, the following are equivalent:</p>
          <ul>
            <li>some DFA recognises <M t="L" />;</li>
            <li>some NFA (with or without ε-moves) recognises <M t="L" />;</li>
            <li>some regular expression describes <M t="L" />.</li>
          </ul>
          <p>Such languages are called <strong>regular</strong>.</p>
        </Note>
        <KleeneCycle />
        <p>
          <strong>Why it matters.</strong> Every regex you write is secretly a finite automaton, so it inherits all the automaton facts: matching takes one pass, it cannot count (no regex matches <M t="a^nb^n" />), and two regexes can be checked for equivalence by converting and comparing machines.
        </p>
        <p>
          <strong>Proof idea.</strong> We already have NFA → DFA. So we need regex → NFA (Thompson, next section) and DFA → regex (state elimination, the section after). Each is proved by giving the algorithm.
        </p>
      </Section>

      <Section id="thompson" n={5} title="Thompson’s construction" sub="Regex → ε-NFA, by snapping pieces together.">
        <Note kind="intuition" title="Lego for machines">
          <p>Every piece has <strong>one entry</strong> and <strong>one exit</strong>. There are four kinds of piece, one per regex ingredient, and ε-arrows act as the connectors. Because each piece has a single entry and exit, you can plug any piece into any slot, just as the regex nests expressions inside expressions.</p>
        </Note>
        <h3>The four pieces</h3>
        <div className="piece-grid">
          <figure className="panel" style={{ marginInline: 0 }}>
            <div className="panel-head"><span className="panel-kicker">symbol</span><div className="panel-title">a</div></div>
            <StateDiagram spec={tSymbol} label="NFA for a single symbol" />
            <figcaption className="panel-caption">Read one <M t="a" /> and you are done.</figcaption>
          </figure>
          <figure className="panel" style={{ marginInline: 0 }}>
            <div className="panel-head"><span className="panel-kicker">then</span><div className="panel-title">R S (here a b)</div></div>
            <StateDiagram spec={tConcat} label="NFA for concatenation" />
            <figcaption className="panel-caption">Join <M t="R" />’s exit to <M t="S" />’s entry with an ε-arrow.</figcaption>
          </figure>
          <figure className="panel" style={{ marginInline: 0 }}>
            <div className="panel-head"><span className="panel-kicker">or</span><div className="panel-title">R ∪ S (here a ∪ b)</div></div>
            <StateDiagram spec={tUnion} label="NFA for union" />
            <figcaption className="panel-caption">A new entry with ε-arrows into both, and both exits flowing into a new exit. The machine guesses which branch to take.</figcaption>
          </figure>
          <figure className="panel" style={{ marginInline: 0 }}>
            <div className="panel-head"><span className="panel-kicker">repeat</span><div className="panel-title">R* (here a*)</div></div>
            <StateDiagram spec={tStar} label="NFA for star" />
            <figcaption className="panel-caption">A <b>back-arrow</b> (exit → entry) to go round again, and a <b>bypass</b> (new entry → new exit) for zero repetitions.</figcaption>
          </figure>
        </div>
        <h3>Building <M t="(a \cup b)^*a" /> step by step</h3>
        <StageStepper
          title="Thompson’s construction for (a ∪ b)*a"
          stages={[
            { spec: thompsonStages[0], title: 'Pieces for a and b', note: <>Start from the innermost parts of the regex: one tiny machine for <M t="a" /> and one for <M t="b" />.</>, focus: ['a1', 'a2', 'b1', 'b2'] },
            { spec: thompsonStages[1], title: 'Union: a ∪ b', note: <>A new entry <M t="u" /> with ε-arrows into both pieces, and both exits flowing into a new exit <M t="v" />.</>, focus: ['u', 'v'] },
            { spec: thompsonStages[2], title: 'Star: (a ∪ b)*', note: <>Wrap it: a back-arrow <M t="v \to u" /> lets you repeat, and the bypass <M t="s \to x" /> allows zero repetitions.</>, focus: ['s', 'x'] },
            { spec: thompsonStages[3], title: 'Concatenate with a: (a ∪ b)*a', note: <>Plug a fresh <M t="a" />-piece onto the exit with an ε-arrow. <M t="f" /> is the single accepting state. Done: 10 states in all, roughly twice the length of the regex.</>, focus: ['c', 'f'] },
          ]}
          caption="Use the arrows to move between stages. Highlighted states are the ones added in that stage."
        />
        <p>The finished machine runs like any NFA. The ε-arrows mean several states light up at once:</p>
        <FASim spec={thompsonFinal} initial="abba" presets={['a', 'ba', 'abba', 'ab', 'bbb']} title="The finished Thompson NFA" hideTrace />
        <p>Regex engines such as RE2 and Rust’s <code>regex</code> build exactly this NFA and then simulate it with sets of states, which guarantees matching in time linear in the input.</p>
      </Section>

      <Section id="state-elimination" n={6} title="State elimination" sub="DFA → regex, by removing states one at a time.">
        <Note kind="intuition" title="summarise the detour">
          <p>When you delete a state <M t="q" />, any path that used to pass through it looks like: arrive at <M t="q" />, loop at <M t="q" /> any number of times, leave. So replace each <M t="p \to q \to r" /> detour by a direct arrow labelled with a regex that says exactly that.</p>
        </Note>
        <Note kind="definition" title="the elimination rule">
          <MB t="R_{pr} \;\leftarrow\; R_{pq}\,(R_{qq})^*\,R_{qr} \;\cup\; R_{pr}" />
          <p>In plain English: the new label from <M t="p" /> to <M t="r" /> is “go <M t="p \to q" />, loop at <M t="q" /> as often as you like, go <M t="q \to r" />”, <em>or</em> whatever direct route already existed.</p>
        </Note>
        <p>The full procedure:</p>
        <ol>
          <li>Add a new start state with an ε-arrow into the old start, and a new accepting state with ε-arrows from every old accepting state. Now there is one entry and one exit.</li>
          <li>Merge parallel arrows into one arrow labelled with their union.</li>
          <li>Pick any state other than the new start and accept, and eliminate it with the rule above. Repeat.</li>
          <li>When only the new start and accept remain, the label on the arrow between them is the answer.</li>
        </ol>
        <StageStepper
          title="Eliminating states from the “even number of 0s” DFA"
          stages={[
            { spec: eliminationStages[0], title: 'The DFA', note: <><M t="E" /> means “an even number of 0s so far” and <M t="O" /> means odd. A 1 changes nothing; a 0 flips between them.</> },
            { spec: eliminationStages[1], title: 'Add a single entry and a single exit', note: <>New start <M t="S" /> with <M t="S \xrightarrow{\varepsilon} E" />, new accept <M t="A" /> with <M t="E \xrightarrow{\varepsilon} A" />.</>, focus: ['S', 'A'] },
            { spec: eliminationStages[2], title: 'Eliminate O', note: <>The only detour through <M t="O" /> is <M t="E \xrightarrow{0} O \xrightarrow{0} E" />, with loop <M t="1" /> at <M t="O" />: that gives <M t="01^*0" />. Added to <M t="E" />’s own loop <M t="1" />, the new loop at <M t="E" /> is <M t="1 \cup 01^*0" />.</>, focus: ['E'] },
            { spec: eliminationStages[3], title: 'Eliminate E', note: <><M t="S \xrightarrow{\varepsilon} E \xrightarrow{\varepsilon} A" /> with loop <M t="1 \cup 01^*0" /> gives <M t="\varepsilon\,(1 \cup 01^*0)^*\,\varepsilon = (1 \cup 01^*0)^*" />. In words: a sequence of blocks, each either a single 1 or a pair of 0s with 1s in between.</>, focus: ['S', 'A'] },
          ]}
          caption="The same rule works on any automaton; only the bookkeeping grows."
        />
        <Note kind="pitfall" title="the order changes the answer, not the language">
          <p>Eliminating states in a different order gives a different-looking regex, but all of them describe the same language. Results can also be exponentially long: automata are often far more compact than regexes.</p>
        </Note>
        <h3>Arden’s lemma: the algebraic shortcut</h3>
        <p>Write one equation per state for “the strings that lead from here to acceptance”. For the example: <M t="X_E = 1X_E \cup 0X_O \cup \varepsilon" /> and <M t="X_O = 1X_O \cup 0X_E" />. Then solve with:</p>
        <Note kind="theorem" title="Arden’s lemma">
          <p>If <M t="\varepsilon \notin L(A)" />, the equation <M t="X = AX \cup B" /> has the unique solution <M t="X = A^*B" />.</p>
        </Note>
        <p>From the second equation <M t="X_O = 1^*0X_E" />; substituting gives <M t="X_E = (1 \cup 01^*0)X_E \cup \varepsilon" />, so <M t="X_E = (1 \cup 01^*0)^*" />. Same answer, no diagrams.</p>
      </Section>

      <Section id="exercises" n={7} title="Exercises" sub="Convert, build and check.">
        <StringQuiz spec={thompsonFinal} strings={['a', 'b', 'ab', 'ba', 'aaba', 'bbbb']} title="Does (a ∪ b)*a match?" />
        <Exercise n={1} level="easy" q={<>How many states does Thompson’s construction produce for <M t="ab" />? For <M t="a^*" />?</>}>
          <p><M t="ab" />: two 2-state pieces joined by an ε-arrow, 4 states. <M t="a^*" />: the 2-state <M t="a" />-piece plus a new entry and exit, 4 states. (Some textbook variants merge states and get fewer; the count is always linear in the regex size.)</p>
        </Exercise>
        <Exercise n={2} level="medium" q={<>Write a regex for binary strings containing both <code>00</code> and <code>11</code>.</>}>
          <p><M t="\Sigma^*00\Sigma^*11\Sigma^* \;\cup\; \Sigma^*11\Sigma^*00\Sigma^*" /> with <M t="\Sigma = (0 \cup 1)" />. Either pair can come first, and they cannot overlap, because they share no symbol.</p>
        </Exercise>
        <Exercise n={3} level="medium" q="Apply the subset construction to the NFA for “third symbol from the end is 1”. How many DFA states are reachable?">
          <p>All 8: every reachable subset is <M t="\{q_0\}" /> plus some subset of <M t="\{q_1, q_2, q_3\}" />, one for each possible pattern of the last three symbols. The accepting subsets are the 4 that contain <M t="q_3" />.</p>
        </Exercise>
        <Exercise n={4} level="hard" q={<>Use state elimination (or Arden’s lemma) on the DFA for “ends in 01” to get a regex. Check it against <M t="(0 \cup 1)^*01" />.</>}>
          <p>With <M t="X_i" /> = strings leading from <M t="q_i" /> to acceptance: <M t="X_0 = 1X_0 \cup 0X_1" />, <M t="X_1 = 0X_1 \cup 1X_2" />, <M t="X_2 = 0X_1 \cup 1X_0 \cup \varepsilon" />. Any correct elimination order gives a regex for “ends in 01”. In an exam, it is fine to simplify to <M t="(0 \cup 1)^*01" /> and justify the step by describing the language.</p>
        </Exercise>
      </Section>
    </ChapterShell>
  );
}
