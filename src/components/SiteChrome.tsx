'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Brand } from './Brand';
import { ChapterNav } from './ChapterNav';
import { GitHubButton } from './GitHubButton';
import { Icon } from './Icon';
import { Dock, mobileDockWidth, type DockItem } from './Dock';
import { CHAPTERS, chapterIndex } from '@/content/chapters';
import { site } from '@/lib/site';

/**
 * Floating glass navbar, mobile menu button, mobile dock and the menu sheet.
 *
 * Mobile behaviour:
 *  - at the top of the page: the floating nav is shown and the round menu button sits top-right;
 *  - scrolling down: the nav slides up out of view and the dock stays hidden below the screen;
 *  - scrolling up: the dock rises, and the menu button travels down and merges into the dock's slot;
 *  - back at the top: the dock sinks away and the menu button returns to the top-right corner.
 */
export function SiteChrome({ stars }: { stars: number | null }) {
  const pathname = usePathname();
  const [atTop, setAtTop] = useState(true);
  const [dir, setDir] = useState<'up' | 'down'>('down');
  const [open, setOpen] = useState(false);
  const [fabHover, setFabHover] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const last = useRef(0);

  useEffect(() => {
    last.current = window.scrollY;
    setAtTop(window.scrollY < 48);
    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 48);
      const dy = y - last.current;
      if (Math.abs(dy) < 8) return;
      setDir(dy > 0 ? 'down' : 'up');
      last.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const dockShown = !atTop && dir === 'up';

  /* Where the mobile menu button is: top-right, inside the dock, or off-screen
     (downwards together with the dock if it was docked, otherwise upwards with the nav). */
  const [fab, setFab] = useState<'top' | 'docked' | 'gone-down' | 'gone-up'>('top');
  useEffect(() => {
    setFab((prev) => {
      if (atTop) return 'top';
      if (dockShown) return 'docked';
      return prev === 'docked' || prev === 'gone-down' ? 'gone-down' : 'gone-up';
    });
  }, [atTop, dockShown]);

  /* The mobile dock stays compact (4 items) until the menu button lands, then widens to hold it.
     It stays wide while leaving downwards, because the button leaves with it. */
  const [merged, setMerged] = useState(false);
  useEffect(() => {
    if (fab === 'docked') {
      const t = setTimeout(() => setMerged(true), 260);
      return () => clearTimeout(t);
    }
    if (fab !== 'gone-down') setMerged(false);
  }, [fab]);

  /* Desktop shows the dock (centred, no menu button) whenever the page is scrolled. */
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)');
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  // on phones the dock stays put under the open menu so the button can close it in place
  const dockVisible = mobile ? dockShown : !atTop && !open;

  const navClass = ['floatnav', 'glass', !atTop && dir === 'down' ? 'hide-d' : '', !atTop ? 'hide-m' : ''].join(' ');

  const slug = pathname.startsWith('/learn/') ? pathname.split('/')[2] : null;
  const idx = slug ? chapterIndex(slug) : -1;
  const prev = idx > 0 ? CHAPTERS[idx - 1] : null;
  const next = idx >= 0 && idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;
  const onLearn = pathname.startsWith('/learn');

  const dockItems: DockItem[] = [
    { key: 'home', label: 'Home', icon: 'home', href: '/', active: pathname === '/' },
    ...(onLearn
      ? [
          { key: 'chapters', label: 'Chapters', icon: 'book', href: '/learn', active: pathname === '/learn' },
          { key: 'prev', label: 'Prev', icon: 'arrowLeft', href: prev ? `/learn/${prev.slug}` : '#', disabled: !prev },
          { key: 'next', label: 'Next', icon: 'arrowRight', href: next ? `/learn/${next.slug}` : '#', disabled: !next },
        ]
      : [
          { key: 'start', label: 'Start', icon: 'play', href: '/learn/introduction' },
          { key: 'chapters', label: 'Chapters', icon: 'book', href: '/learn' },
          // no GitHub on the phone dock: the menu sheet already has it
          ...(mobile ? [] : [{ key: 'github', label: 'GitHub', icon: 'github', href: site.repoUrl, external: true }]),
        ]),
  ] as DockItem[];

  return (
    <>
      <header className={navClass}>
        <Brand />
        <nav className="nav-links" aria-label="Main">
          <Link href="/learn" className={pathname === '/learn' ? 'active' : ''}>Chapters</Link>
          <Link href="/learn/introduction" className={slug === 'introduction' ? 'active' : ''}>Introduction</Link>
          <Link href="/learn/dfa" className={['dfa', 'nfa'].includes(slug ?? '') ? 'active' : ''}>Machines</Link>
          <Link href="/learn/big-picture" className={slug === 'big-picture' ? 'active' : ''}>Big picture</Link>
        </nav>
        <span className="nav-spacer" />
        <div className="nav-actions">
          <GitHubButton stars={stars} size="sm" label="Star" />
          {!onLearn && (
            <Link href="/learn/introduction" className="btn btn-primary btn-sm">
              Get started <Icon name="arrowRight" />
            </Link>
          )}
        </div>
      </header>

      <button
        type="button"
        className={`menu-fab${fab === 'top' ? '' : ` ${fab}`}${open ? ' open' : ''}`}
        style={{ ['--fw' as string]: `${mobileDockWidth(dockItems.length)}px` }}
        tabIndex={fab === 'gone-up' || fab === 'gone-down' ? -1 : undefined}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={(e) => {
          // the mask grows out of (and shrinks back into) the button's current position
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin({ x: r.left + r.width / 2 - 12, y: r.top + r.height / 2 - 12 });
          setOpen((o) => !o);
        }}
        onMouseEnter={() => setFabHover(true)}
        onMouseLeave={() => setFabHover(false)}
        onFocus={() => setFabHover(true)}
        onBlur={() => setFabHover(false)}
      >
        <Icon name={open ? 'close' : 'menu'} />
      </button>

      <Dock
        items={dockItems}
        className={`dock glass${dockVisible ? ' shown' : ''}${mobile && merged ? ' merged' : ''}`}
        inert={!dockVisible}
        slot={mobile}
        slotHover={mobile && fab === 'docked' && fabHover}
      />

      <div className={`sheet-scrim${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <div
        className={`sheet${open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        style={origin ? { ['--ox' as string]: `${origin.x}px`, ['--oy' as string]: `${origin.y}px` } : undefined}
      >
        <h2>Explore</h2>
        <ChapterNav onNavigate={() => setOpen(false)} />
        <div className="sheet-actions">
          <Link href="/learn/introduction" className="btn btn-primary" onClick={() => setOpen(false)}>
            Get started <Icon name="arrowRight" />
          </Link>
          <GitHubButton stars={stars} />
        </div>
      </div>
    </>
  );
}
