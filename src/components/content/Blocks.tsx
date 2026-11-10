import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import { roman } from '@/lib/site';

export function Section({ id, n, title, sub, children }: { id: string; n: number; title: string; sub?: string; children: ReactNode }) {
  return (
    <section id={id} className="section prose">
      <div className="section-title">
        <span className="roman">{roman(n)}.</span>
        <h2>{title}</h2>
      </div>
      {sub && <p className="section-sub">{sub}</p>}
      {children}
    </section>
  );
}

const NOTE: Record<string, { icon: IconName; label: string }> = {
  intuition: { icon: 'bulb', label: 'Intuition' },
  definition: { icon: 'ruler', label: 'Definition' },
  theorem: { icon: 'check', label: 'Theorem' },
  pitfall: { icon: 'alert', label: 'Pitfall' },
  plain: { icon: 'flask', label: 'Example' },
};

export function Note({ kind, title, children }: { kind: keyof typeof NOTE; title?: string; children: ReactNode }) {
  const n = NOTE[kind];
  return (
    <aside className={`note ${kind}`}>
      <div className="note-title">
        <Icon name={n.icon} />
        {title ? `${n.label} · ${title}` : n.label}
      </div>
      {children}
    </aside>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="table">
      <table>{children}</table>
    </div>
  );
}
