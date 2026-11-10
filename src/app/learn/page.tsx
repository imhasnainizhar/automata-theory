import Link from 'next/link';
import type { Metadata } from 'next';
import { CHAPTERS, GROUPS } from '@/content/chapters';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Chapters', description: 'Every chapter of WhatAutomata, from formal languages to Turing machines.' };

export default function LearnIndex() {
  return (
    <main className="chapter prose">
      <div className="chapter-head">
        <span className="eyebrow"><Icon name="book" /> The course</span>
        <h1>Chapters</h1>
        <p className="lede">Start with the foundations, build intuition with hands-on machines, then work through the four machine families. Each family has a deterministic and a nondeterministic chapter.</p>
      </div>
      {GROUPS.map((g) => (
        <section key={g}>
          <h3>{g}</h3>
          <div className="index-grid">
            {CHAPTERS.filter((c) => c.group === g).map((c) => (
              <Link key={c.slug} href={`/learn/${c.slug}`} className="index-card">
                <span className="chap-icon"><Icon name={c.icon} /></span>
                <span>
                  <h3>{c.title}</h3>
                  <p>{c.blurb}</p>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
