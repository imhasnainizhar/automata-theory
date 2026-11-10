'use client';

import Link from 'next/link';
import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Icon, type IconName } from './Icon';

export interface DockItem {
  key: string;
  label: string;
  icon: IconName;
  href: string;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
}

/** Mobile dock geometry, shared with the CSS that moves the menu button into the dock's slot. */
export const MOBILE_DOCK = { gap: 2, pad: 6, slot: 52 };
/** Pill-shaped items: as wide as fits, so 4 items plus the menu slot still fit a 375px phone. */
export const mobileItemWidth = (n: number) => (n <= 3 ? 76 : 68);
/** Final (merged) mobile dock width for n items plus the menu-button slot. */
export const mobileDockWidth = (n: number) =>
  2 * MOBILE_DOCK.pad + n * mobileItemWidth(n) + (n - 1) * MOBILE_DOCK.gap + MOBILE_DOCK.gap + MOBILE_DOCK.slot;

/**
 * Glass dock with a single highlight "pill". The pill sits under the active item and slides
 * under whichever item is hovered (or keyboard-focused), returning to the active one afterwards.
 */
export function Dock({
  items,
  className,
  inert,
  slot = false,
  slotHover = false,
}: {
  items: DockItem[];
  className: string;
  inert: boolean;
  /** reserve the slot the mobile menu button lands in */
  slot?: boolean;
  /** the docked menu button is hovered: the pill slides under the slot */
  slotHover?: boolean;
}) {
  const navRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [pill, setPill] = useState<{ x: number; w: number; on: boolean; instant: boolean }>({ x: 0, w: 0, on: false, instant: true });

  const activeIdx = items.findIndex((i) => i.active);
  const target: number | 'slot' | null = slotHover ? 'slot' : hover ?? (activeIdx >= 0 ? activeIdx : null);

  const measure = useCallback(() => {
    if (target === null) return setPill((p) => ({ ...p, on: false }));
    const el = target === 'slot' ? slotRef.current : itemRefs.current[target];
    if (!el) return;
    setPill((p) => ({ x: el.offsetLeft, w: el.offsetWidth, on: true, instant: !p.on }));
  }, [target]);

  useLayoutEffect(measure, [measure, items.length]);
  useLayoutEffect(() => {
    // the dock changes width when the menu button merges in, and on resize
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(nav);
    return () => ro.disconnect();
  }, [measure]);

  const pillStyle: CSSProperties = {
    width: pill.w,
    transform: `translateX(${pill.x}px)`,
    opacity: pill.on ? 1 : 0,
    transition: pill.instant ? 'opacity .2s ease' : undefined,
  };

  return (
    <nav
      ref={navRef}
      className={className}
      style={{ ['--dock-item' as string]: `${mobileItemWidth(items.length)}px` }}
      aria-label="Quick navigation"
      inert={inert}
      onMouseLeave={() => setHover(null)}
    >
      <span className="dock-pill" style={pillStyle} aria-hidden="true" />
      {items.map((it, i) => {
        const common = {
          ref: (el: HTMLElement | null) => { itemRefs.current[i] = el; },
          className: `dock-item${it.active ? ' active' : ''}${target === i ? ' lit' : ''}`,
          onMouseEnter: () => !it.disabled && setHover(i),
          onFocus: () => !it.disabled && setHover(i),
          onBlur: () => setHover(null),
          'aria-current': it.active ? ('page' as const) : undefined,
          'aria-disabled': it.disabled || undefined,
          tabIndex: it.disabled ? -1 : undefined,
        };
        const body = (
          <>
            <span className="dock-icon">
              <Icon name={it.icon} />
              {it.external && <Icon name="external" className="dock-ext" />}
            </span>
            <span className="dock-label">{it.label}</span>
          </>
        );
        return it.external ? (
          <a key={it.key} href={it.href} target="_blank" rel="noreferrer" {...common}>{body}</a>
        ) : (
          <Link key={it.key} href={it.href} {...common}>{body}</Link>
        );
      })}
      {slot && <span ref={slotRef} className="dock-slot" aria-hidden="true" />}
    </nav>
  );
}
