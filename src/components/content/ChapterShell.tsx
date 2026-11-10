import Link from 'next/link';
import type { ReactNode } from 'react';
import { CHAPTERS, chapterIndex, getChapter } from '@/content/chapters';
import { Icon } from '../Icon';

export function ChapterShell({ slug, lede, chips, children }: { slug: string; lede?: ReactNode; chips?: { text: string; tone?: 'moss' | 'clay' | 'ochre' | 'teal' }[]; children: ReactNode }) {
  const c = getChapter(slug)!;
  const i = chapterIndex(slug);
  const prev = i > 0 ? CHAPTERS[i - 1] : null;
  const next = i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : null;
  return (
    <main className="chapter">
      <header className="chapter-head">
        <span className="eyebrow"><Icon name={c.icon} /> {c.group}</span>
        <h1>{c.title}</h1>
        <p className="lede">{lede ?? c.blurb}</p>
        {chips && (
          <div className="meta">
            {chips.map((x) => <span key={x.text} className={`chip ${x.tone ?? ''}`}>{x.text}</span>)}
          </div>
        )}
      </header>
      {children}
      <nav className="pager" aria-label="Chapter navigation">
        {prev ? (
          <Link href={`/learn/${prev.slug}`}><small>← Previous</small><span>{prev.title}</span></Link>
        ) : <span />}
        {next && (
          <Link href={`/learn/${next.slug}`} className="next"><small>Next →</small><span>{next.title}</span></Link>
        )}
      </nav>
    </main>
  );
}
