'use client';

export interface TNode { id: number; label: string; kids: TNode[]; terminal: boolean }

export function TreeView({ root, fresh, maxWidth = 760 }: { root: TNode; fresh?: Set<number>; maxWidth?: number }) {
  type P = { n: TNode; x: number; d: number };
  const placed: P[] = [];
  const edges: [P, P][] = [];
  let leaf = 0, depth = 0;
  const walk = (n: TNode, d: number): P => {
    depth = Math.max(depth, d);
    if (!n.kids.length) { const p = { n, x: leaf++, d }; placed.push(p); return p; }
    const ks = n.kids.map((k) => walk(k, d + 1));
    const p = { n, x: (ks[0].x + ks[ks.length - 1].x) / 2, d };
    placed.push(p);
    ks.forEach((k) => edges.push([p, k]));
    return p;
  };
  walk(root, 0);
  const gx = 50, gy = 54, pad = 24;
  const W = Math.max(1, leaf - 1) * gx + pad * 2, H = depth * gy + pad * 2;
  const X = (p: P) => pad + p.x * gx, Y = (p: P) => pad + p.d * gy;
  return (
    <div className="canvas" style={{ padding: 6 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: Math.min(W * 1.3, maxWidth), margin: '0 auto' }} role="img" aria-label="Parse tree">
        {edges.map(([a, b], i) => <line key={i} x1={X(a)} y1={Y(a)} x2={X(b)} y2={Y(b)} className="tree-edge" />)}
        {placed.map((p) => (
          <g key={p.n.id} className={`tree-node${p.n.terminal ? ' leaf' : ''}${fresh?.has(p.n.id) ? ' fresh' : ''}`}>
            <circle cx={X(p)} cy={Y(p)} r={15} />
            <text x={X(p)} y={Y(p)}>{p.n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
