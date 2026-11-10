'use client';

import { useEffect } from 'react';
import { OverlayScrollbars, type PartialOptions } from 'overlayscrollbars';

/**
 * Custom scrollbars via OverlayScrollbars (~13 kB gzipped, no dependencies).
 * - The page itself: initialised on <body>; window.scrollY / scrollTo / scroll events keep working.
 * - Inner scroll areas: any element with a `data-scroll` attribute ("y", "x" or "both"),
 *   including ones that appear later (a MutationObserver picks them up).
 * Native scrolling is untouched; only the scrollbars are drawn by us.
 */
const BASE: PartialOptions = {
  scrollbars: { theme: 'os-theme-wa', autoHide: 'move', autoHideDelay: 900, clickScroll: true },
};

let page: OverlayScrollbars | null = null;

/** Lock or unlock page scrolling (e.g. while the menu sheet is open). */
export function lockPageScroll(lock: boolean) {
  if (page) page.options({ overflow: { y: lock ? 'hidden' : 'scroll' } });
  else document.body.style.overflow = lock ? 'hidden' : '';
}

function initArea(el: HTMLElement) {
  if (OverlayScrollbars(el) || el.dataset.osDone) return;
  el.dataset.osDone = '1';
  const axis = el.dataset.scroll;
  // the element is its own viewport, so the library adds no wrapper and never moves React-owned children
  OverlayScrollbars({ target: el, elements: { viewport: el } }, {
    ...BASE,
    overflow: { x: axis === 'y' ? 'hidden' : 'scroll', y: axis === 'x' ? 'hidden' : 'scroll' },
    scrollbars: { ...BASE.scrollbars, autoHide: 'leave', autoHideDelay: 400 },
  });
}

export function Scrollbars() {
  useEffect(() => {
    page = OverlayScrollbars(
      { target: document.body, elements: { viewport: document.body }, cancel: { body: false } },
      { ...BASE, overflow: { x: 'hidden', y: 'scroll' } },
    );
    const scan = (root: ParentNode) => root.querySelectorAll<HTMLElement>('[data-scroll]:not([data-os-done])').forEach(initArea);
    scan(document);
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; scan(document); });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      page?.destroy();
      page = null;
    };
  }, []);
  return null;
}
