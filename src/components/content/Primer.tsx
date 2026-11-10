'use client';

import { useState, type ReactNode } from 'react';
import { Icon } from '../Icon';

/** "In plain words": the beginner-friendly opening of a chapter, before any notation. */
export function Primer({ children, analogy }: { children: ReactNode; analogy?: ReactNode }) {
  return (
    <section className="primer" aria-label="In plain words">
      <div className="primer-label">
        <Icon name="sprout" /> Start here · in plain words
      </div>
      <div className="primer-body">{children}</div>
      {analogy && (
        <div className="primer-analogy">
          <span>Everyday picture</span>
          <div>{analogy}</div>
        </div>
      )}
    </section>
  );
}

export interface KeyTerm {
  term: ReactNode;
  /** one short, jargon-free line */
  plain: ReactNode;
  /** the fuller explanation: why it matters, an example, common confusions */
  more: ReactNode;
}

/** Expandable glossary of the terms a beginner is most likely to trip on in this chapter. */
export function KeyTerms({ terms, title = 'Key terms, explained' }: { terms: KeyTerm[]; title?: string }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setOpen((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  const allOpen = open.size === terms.length;
  return (
    <section className="keyterms" aria-label={title}>
      <div className="keyterms-head">
        <h3><Icon name="book" /> {title}</h3>
        <button type="button" className="keyterms-all" onClick={() => setOpen(allOpen ? new Set() : new Set(terms.map((_, i) => i)))}>
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>
      <ul>
        {terms.map((t, i) => {
          const isOpen = open.has(i);
          return (
            <li key={i} className={isOpen ? 'open' : ''}>
              <button type="button" className="kt-row" aria-expanded={isOpen} onClick={() => toggle(i)}>
                <span className="kt-term">{t.term}</span>
                <span className="kt-plain">{t.plain}</span>
                <Icon name="chevron" className="kt-chev" />
              </button>
              <div className="expand" data-open={isOpen}>
                <div className="expand-inner" inert={!isOpen}>
                  <div className="kt-more">{t.more}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
