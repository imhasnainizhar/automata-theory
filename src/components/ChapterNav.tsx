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

export function ChapterNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const currentSlug = pathname.startsWith('/learn/') ? pathname.split('/')[2] : null;
  const current = CHAPTERS.find((c) => c.slug === currentSlug);
  const active = useActiveSection(current ? current.sections.map((s) => s.id) : []);

  return (
    <nav aria-label="Chapters">
      {GROUPS.map((group) => (
        <div key={group}>
          <div className="chap-group">{group}</div>
          <ul className="chap-list">
            {CHAPTERS.filter((c) => c.group === group).map((c) => {
              const isCur = c.slug === currentSlug;
              return (
                <li key={c.slug}>
                  <Link href={`/learn/${c.slug}`} className={`chap-link${isCur ? ' current' : ''}`} onClick={onNavigate} aria-current={isCur ? 'page' : undefined}>
                    <span className="chap-icon">
                      <Icon name={c.icon} />
                    </span>
                    <span>{c.title}</span>
                  </Link>
                  {isCur && (
                    <ul className="sub-list">
                      {c.sections.map((s, i) => (
                        <li key={s.id}>
                          <a href={`#${s.id}`} className={`sub-link${active === s.id ? ' active' : ''}`} onClick={onNavigate}>
                            <span className="roman">{roman(i + 1)}</span>
                            <span>{s.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
