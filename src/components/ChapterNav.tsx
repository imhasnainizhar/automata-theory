'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CHAPTERS, GROUPS } from '@/content/chapters';
import { roman } from '@/lib/site';
import { Icon } from './Icon';

/** Tracks which section of the current chapter is on screen. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!ids.length) return;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const onScroll = () => {
      const line = window.innerHeight * 0.3;
      let cur: string | null = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top - line <= 0) cur = el.id;
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ids.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

/**
 * Chapter list used by the desktop sidebar and the mobile menu.
 * Every chapter can be expanded to show its sections; the current chapter starts expanded.
 */
export function ChapterNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const currentSlug = pathname.startsWith('/learn/') ? pathname.split('/')[2] : null;
  const current = CHAPTERS.find((c) => c.slug === currentSlug);
  const active = useActiveSection(current ? current.sections.map((s) => s.id) : []);

  const [open, setOpen] = useState<Set<string>>(() => new Set(currentSlug ? [currentSlug] : []));
  // when the reader moves to another chapter, make sure that chapter is open
  useEffect(() => {
    if (currentSlug) setOpen((prev) => (prev.has(currentSlug) ? prev : new Set(prev).add(currentSlug)));
  }, [currentSlug]);
  const toggle = (slug: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  return (
    <nav aria-label="Chapters">
      {GROUPS.map((group) => (
        <div key={group}>
          <div className="chap-group">{group}</div>
          <ul className="chap-list">
            {CHAPTERS.filter((c) => c.group === group).map((c) => {
              const isCur = c.slug === currentSlug;
              const isOpen = open.has(c.slug);
              const listId = `sections-${c.slug}`;
              return (
                <li key={c.slug} className={`chap-item${isOpen ? ' open' : ''}`}>
                  <div className="chap-row">
                    <Link href={`/learn/${c.slug}`} className={`chap-link${isCur ? ' current' : ''}`} onClick={onNavigate} aria-current={isCur ? 'page' : undefined}>
                      <span className="chap-icon">
                        <Icon name={c.icon} />
                      </span>
                      <span>{c.title}</span>
                    </Link>
                    <button
                      type="button"
                      className="chap-toggle"
                      aria-expanded={isOpen}
                      aria-controls={listId}
                      aria-label={`${isOpen ? 'Hide' : 'Show'} sections of ${c.title}`}
                      onClick={() => toggle(c.slug)}
                    >
                      <Icon name="chevron" />
                    </button>
                  </div>
                  <div className="expand" data-open={isOpen} id={listId}>
                    <div className="expand-inner">
                      <ul className="sub-list" inert={!isOpen}>
                        {c.sections.map((s, i) => (
                          <li key={s.id} style={{ ['--i' as string]: i }}>
                            <Link
                              href={isCur ? `#${s.id}` : `/learn/${c.slug}#${s.id}`}
                              className={`sub-link${isCur && active === s.id ? ' active' : ''}`}
                              onClick={onNavigate}
                            >
                              <span className="roman">{roman(i + 1)}</span>
                              <span>{s.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
