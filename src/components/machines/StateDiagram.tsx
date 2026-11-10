'use client';

import { useId, useMemo } from 'react';
import { layout, type MachineSpec } from '@/lib/machines';

export function StateDiagram({
  spec,
  active,
  hot,
  label,
}: {
  spec: MachineSpec;
  active?: Set<string>;
  hot?: Set<number>;
  label?: string;
}) {
  const L = useMemo(() => layout(spec), [spec]);
  const uid = useId().replace(/:/g, '');
  return (
    <div className="canvas">
      <svg viewBox={`0 0 ${L.W} ${L.H}`} role="img" aria-label={label ?? 'State diagram'}>
        <defs>
          {(['n', 'h'] as const).map((k) => (
            <marker key={k} id={`${uid}-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
              <path d="M0,0.6 L10,5 L0,9.4 z" className={k === 'h' ? 'd-head hot' : 'd-head'} />
            </marker>
          ))}
        </defs>
        <g>
          {L.edges.map((e, i) => {
            const isHot = hot?.has(i);
            return <path key={i} d={e.d} className={`d-edge${isHot ? ' hot' : ''}`} markerEnd={`url(#${uid}-${isHot ? 'h' : 'n'})`} />;
          })}
          {L.start && <line {...L.start} className="d-start" markerEnd={`url(#${uid}-n)`} />}
        </g>
        <g>
          {L.nodes.map((n) => (
            <g key={n.id} className={`d-state${active?.has(n.id) ? ' on' : ''}${n.accept ? ' acc' : ''}${n.dead ? ' dead' : ''}`}>
              <circle cx={n.x} cy={n.y} r={n.r} />
              {n.accept && <circle cx={n.x} cy={n.y} r={n.r - 4.5} />}
              <text x={n.x} y={n.y}>
                {n.base}
                {n.sub && (
                  <tspan fontSize="0.7em" dy="4">
                    {n.sub}
                  </tspan>
                )}
              </text>
            </g>
          ))}
        </g>
        <g>
          {L.edges.map((e, i) => (
            <text key={i} x={e.lx} y={e.ly} className={`d-label${hot?.has(i) ? ' hot' : ''}`}>
              {e.lines.map((ln, j) => (
                <tspan key={j} x={e.lx} dy={j === 0 ? 0 : 16}>
                  {ln}
                </tspan>
              ))}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
