import { Brand } from './Brand';
import { GitHubButton } from './GitHubButton';
import { site } from '@/lib/site';

export function Footer({ stars }: { stars: number | null }) {
  return (
    <footer className="footer">
      <div className="footer-row">
        <div className="footer-brand">
          <Brand />
          <p>
            An open, intuition-first course on automata theory.
            <br />
            Run every machine in your browser, from finite automata to Turing machines.
          </p>
        </div>
        <GitHubButton stars={stars} label="Star on GitHub" />
      </div>
      <div className="footer-copy">
        © {site.year} {site.name} · Content CC BY 4.0 · Code MIT
      </div>
    </footer>
  );
}
