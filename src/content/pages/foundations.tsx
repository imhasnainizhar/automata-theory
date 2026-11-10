import { ChapterShell } from '@/components/content/ChapterShell';
import { Note, Section, Table } from '@/components/content/Blocks';
import { M, MB } from '@/components/content/Math';
import { Exercise } from '@/components/content/Exercise';
import { StringLab } from '@/components/widgets/StringLab';
import { ChomskyExplorer } from '@/components/widgets/ChomskyExplorer';
import { DerivationPlayground } from '@/components/widgets/DerivationPlayground';

export default function Foundations() {
  return (
    <ChapterShell
      slug="foundations"
      lede="Before machines, we need something for them to read. This chapter builds the vocabulary of the whole subject: alphabets, strings, languages, and the grammars that generate them."
      chips={[{ text: '35 min read', tone: 'moss' }, { text: '3 interactive tools', tone: 'ochre' }]}
    >
      <Section id="alphabets-and-strings" n={1} title="Alphabets & strings">
        <Note kind="definition">
          <ul>
            <li>An <strong>alphabet</strong> <M t="\Sigma" /> is a finite, non-empty set of symbols, such as <M t="\{0,1\}" />, <M t="\{a,b,c\}" />, or all of ASCII.</li>
            <li>A <strong>string</strong> (or word) over <M t="\Sigma" /> is a finite sequence of symbols from <M t="\Sigma" />, such as <M t="0110" />.</li>
            <li>The <strong>empty string</strong> <M t="\varepsilon" /> has length 0.</li>
            <li><M t="|w|" /> is the length of <M t="w" />. <M t="\Sigma^k" /> is the set of strings of length exactly <M t="k" />, and <M t="\Sigma^*" /> is the set of <em>all</em> strings, including <M t="\varepsilon" />.</li>
          </ul>
        </Note>
        <p>The basic operations on strings:</p>
        <ul>
          <li><strong>Concatenation</strong> <M t="xy" />: <M t="x" /> followed by <M t="y" />. It is associative, and <M t="\varepsilon" /> is its identity: <M t="\varepsilon w = w\varepsilon = w" />.</li>
          <li><strong>Powers</strong>: <M t="w^0 = \varepsilon" /> and <M t="w^{k+1} = w^k w" />, so <M t="a^3b^2 = aaabb" />.</li>
          <li><strong>Reversal</strong> <M t="w^R" />: <M t="(abc)^R = cba" />. A <strong>palindrome</strong> satisfies <M t="w = w^R" />.</li>
          <li><strong>Prefix, suffix, substring</strong>: <M t="x" /> is a prefix of <M t="w" /> if <M t="w = xy" /> for some <M t="y" />.</li>
        </ul>
        <StringLab />
      </Section>

      <Section id="languages" n={2} title="Languages">
        <Note kind="definition">
          <p>A <strong>language</strong> over <M t="\Sigma" /> is any set of strings over <M t="\Sigma" />, that is, any subset <M t="L \subseteq \Sigma^*" />.</p>
        </Note>
        <p>Languages can be finite, like <M t="\{ab, ba\}" />, or infinite, like <M t="\{0^n1^n : n \ge 0\} = \{\varepsilon, 01, 0011, \dots\}" />. Most interesting ones are infinite, which is exactly why we need finite machines and finite grammars to describe them.</p>
        <Note kind="pitfall" title="three different empties">
          <p>
            <M t="\varepsilon" /> is the empty <em>string</em>. <M t="\emptyset" /> is the empty <em>language</em>, with no strings at all. <M t="\{\varepsilon\}" /> is a language with exactly one string, the empty one. Under concatenation <M t="\emptyset" /> behaves like 0 and <M t="\{\varepsilon\}" /> like 1:
          </p>
          <MB t="L\,\emptyset = \emptyset \qquad L\,\{\varepsilon\} = L \qquad \emptyset^* = \{\varepsilon\}" />
        </Note>
      </Section>

      <Section id="operations" n={3} title="Operations on languages">
        <p>Since languages are sets, they support union, intersection and complement. Strings add three more operations:</p>
        <Table>
          <thead><tr><th>Operation</th><th>Definition</th><th>Example, with A = {'{a, ab}'}, B = {'{b}'}</th></tr></thead>
          <tbody>
            <tr><td>Union</td><td><M t="A \cup B" /></td><td><M t="\{a, ab, b\}" /></td></tr>
            <tr><td>Concatenation</td><td><M t="AB = \{xy : x \in A, y \in B\}" /></td><td><M t="\{ab, abb\}" /></td></tr>
            <tr><td>Kleene star</td><td><M t="A^* = \bigcup_{k \ge 0} A^k" /></td><td><M t="\{\varepsilon, a, ab, aa, aab, \dots\}" /></td></tr>
            <tr><td>Complement</td><td><M t="\overline{A} = \Sigma^* \setminus A" /></td><td>every string except <M t="a" /> and <M t="ab" /></td></tr>
            <tr><td>Reversal</td><td><M t="A^R = \{w^R : w \in A\}" /></td><td><M t="\{a, ba\}" /></td></tr>
          </tbody>
        </Table>
        <p>These operations come back again and again. A class of languages is <strong>closed</strong> under an operation if applying it never takes you out of the class. Closure properties are among the most useful tools in the subject.</p>
      </Section>

      <Section id="problems-as-languages" n={4} title="Problems as languages">
        <Note kind="intuition" title="the key modelling trick">
          <p>Encode every input as a string. A yes/no problem then becomes <em>the set of strings whose answer is yes</em>, which is a language. “Solving the problem” means deciding membership in that language.</p>
        </Note>
        <Table>
          <thead><tr><th>Problem</th><th>Language</th></tr></thead>
          <tbody>
            <tr><td>Is this binary number divisible by 3?</td><td><M t="\{0, 11, 110, 1001, \dots\}" /></td></tr>
            <tr><td>Are these brackets balanced?</td><td><M t="\{\varepsilon, (), (()), ()(), \dots\}" /></td></tr>
            <tr><td>Does this program compile?</td><td>all syntactically valid source files</td></tr>
            <tr><td>Does program <M t="P" /> halt on input <M t="x" />?</td><td><M t="\{\langle P, x\rangle : P \text{ halts on } x\}" /></td></tr>
          </tbody>
        </Table>
        <p>From here on, “a machine recognises a language” and “a machine solves a problem” mean the same thing.</p>
      </Section>

      <Section id="grammars" n={5} title="Grammars">
        <p>Machines <em>recognise</em> languages: they read a string and say yes or no. Grammars <em>generate</em> them: start from a symbol and rewrite until only real characters remain.</p>
        <Note kind="definition" title="grammar">
          <p>A grammar is a 4-tuple <M t="G = (V, \Sigma, R, S)" />:</p>
          <ul>
            <li><M t="V" />: <strong>variables</strong> (nonterminals), written in capitals;</li>
            <li><M t="\Sigma" />: <strong>terminals</strong>, the actual alphabet;</li>
            <li><M t="R" />: <strong>rules</strong> of the form <M t="\alpha \to \beta" />, meaning “you may replace <M t="\alpha" /> by <M t="\beta" />”;</li>
            <li><M t="S \in V" />: the <strong>start variable</strong>.</li>
          </ul>
          <p>The language <M t="L(G)" /> is the set of terminal strings you can derive from <M t="S" />.</p>
        </Note>
        <p>Grammar <M t="S \to aSb \mid \varepsilon" /> generates <M t="\{a^nb^n\}" />. Derive <code>aaabbb</code> yourself:</p>
        <DerivationPlayground
          rules={['S -> aSb | ε']}
          goal="aaabbb"
          title="Rewrite S until only terminals remain"
          caption="Each click applies a rule to the leftmost variable. The tree below is the parse tree: it shows which part of the string each rule produced."
        />
      </Section>

      <Section id="chomsky-hierarchy" n={6} title="The Chomsky hierarchy">
        <p>
          In 1956 Noam Chomsky classified grammars by <em>how restricted their rules are</em>. The more restricted the rules, the smaller the class of languages and the simpler the machine needed to recognise them.
        </p>
        <ChomskyExplorer />
        <Table>
          <thead><tr><th>Type</th><th>Rule shape</th><th>Language class</th><th>Machine</th></tr></thead>
          <tbody>
            <tr><td>3</td><td><M t="A \to aB,\; A \to a,\; A \to \varepsilon" /></td><td>Regular</td><td>Finite automaton</td></tr>
            <tr><td>2</td><td><M t="A \to \gamma" /></td><td>Context-free</td><td>Pushdown automaton</td></tr>
            <tr><td>1</td><td><M t="\alpha \to \beta,\; |\alpha| \le |\beta|" /></td><td>Context-sensitive</td><td>Linear bounded automaton</td></tr>
            <tr><td>0</td><td><M t="\alpha \to \beta" /></td><td>Recursively enumerable</td><td>Turing machine</td></tr>
          </tbody>
        </Table>
        <p>The rest of the course climbs this ladder from the bottom, one machine at a time.</p>
      </Section>

      <section className="section prose">
        <div className="section-title"><h2 style={{ fontSize: 26 }}>Check yourself</h2></div>
        <Exercise n={1} level="easy" q={<>List <M t="\Sigma^2" /> for <M t="\Sigma = \{a, b\}" />. How many strings are in <M t="\Sigma^k" />?</>}>
          <p><M t="\{aa, ab, ba, bb\}" />. In general <M t="|\Sigma^k| = |\Sigma|^k" />, here <M t="2^k" />.</p>
        </Exercise>
        <Exercise n={2} level="easy" q={<>Compute <M t="\{a, b\}\{\varepsilon, b\}" /> and <M t="\{a\}\,\emptyset" />.</>}>
          <p><M t="\{a, ab, b, bb\}" /> and <M t="\emptyset" />, because there is nothing to pair <M t="a" /> with.</p>
        </Exercise>
        <Exercise n={3} level="medium" q={<>When is <M t="L^*" /> finite?</>}>
          <p>Exactly when <M t="L = \emptyset" /> or <M t="L = \{\varepsilon\}" />; in both cases <M t="L^* = \{\varepsilon\}" />. Any non-empty string <M t="w \in L" /> gives infinitely many strings <M t="w, ww, www, \dots" /></p>
        </Exercise>
        <Exercise n={4} level="medium" q={<>Write a grammar for all palindromes over <M t="\{a, b\}" />.</>}>
          <p><M t="S \to aSa \mid bSb \mid a \mid b \mid \varepsilon" />. Build outward from the middle: each rule wraps matching symbols around a smaller palindrome.</p>
        </Exercise>
      </section>
    </ChapterShell>
  );
}
