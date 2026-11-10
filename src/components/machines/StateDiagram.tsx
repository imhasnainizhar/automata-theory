'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { layout, type Layout, type MachineSpec } from '@/lib/machines';
import { Icon } from '../Icon';

type Box = { x: number; y: number; w: number; h: number };

/** Readable zoom: at least this many screen px per diagram unit when following. */
const MIN_PX_PER_UNIT = 0.95;
const MAX_PX_PER_UNIT = 1.25;
/** Space kept around the active states (room for loops and labels). */
const FOCUS_PAD = 78;

function DiagramMarks({ L, uid, active, hot }: { L: Layout; uid: string; active?: Set<string>; hot?: Set<number> }) {
  return (
    <>
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
    </>
  );
}

/**
 * State diagram with a camera.
 * - Wide containers show the whole machine.
 * - Narrow containers zoom in to a readable scale and the camera follows the active states,
 *   keeping their surroundings on screen as the run advances.
 * - Drag to pan (pauses following); "Follow" re-centres; "Fit" toggles the whole-machine view.
 */
export function StateDiagram({ spec, active, hot, label }: { spec: MachineSpec; active?: Set<string>; hot?: Set<number>; label?: string }) {
  const L = useMemo(() => layout(spec), [spec]);
  const uid = useId().replace(/:/g, '');
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cam = useRef<Box>({ x: 0, y: 0, w: L.W, h: L.H });
  const goal = useRef<Box>(cam.current);
  const raf = useRef(0);

  const [size, setSize] = useState<{ cw: number; ch: number } | null>(null);
  const [follow, setFollow] = useState(true);
  const [fitAll, setFitAll] = useState(false);

  // container size → canvas height (only recomputed on resize)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const cw = e.contentRect.width;
      const natural = (cw * L.H) / L.W;
      const ch = Math.round(Math.min(440, Math.max(cw < 560 ? 230 : 160, natural)));
      setSize((s) => (s && Math.abs(s.cw - cw) < 1 && s.ch === ch ? s : { cw, ch }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [L.W, L.H]);

  const fitScale = size ? Math.min(size.cw / L.W, size.ch / L.H) : 1;
  const zoomable = !!size && fitScale < MIN_PX_PER_UNIT * 0.97;

  /** smooth camera: lerp toward the goal on rAF, writing the viewBox attribute directly (no re-renders) */
  const animate = useCallback((instant = false) => {
    cancelAnimationFrame(raf.current);
    const svg = svgRef.current;
    if (!svg) return;
    const apply = (b: Box) => svg.setAttribute('viewBox', `${b.x.toFixed(1)} ${b.y.toFixed(1)} ${b.w.toFixed(1)} ${b.h.toFixed(1)}`);
    if (instant || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cam.current = { ...goal.current };
      return apply(cam.current);
    }
    const tick = () => {
      const c = cam.current, g = goal.current;
      const next = { x: c.x + (g.x - c.x) * 0.16, y: c.y + (g.y - c.y) * 0.16, w: c.w + (g.w - c.w) * 0.16, h: c.h + (g.h - c.h) * 0.16 };
      const done = Math.abs(next.x - g.x) + Math.abs(next.y - g.y) + Math.abs(next.w - g.w) + Math.abs(next.h - g.h) < 0.4;
      cam.current = done ? { ...g } : next;
      apply(cam.current);
      if (!done) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, []);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const activeKey = (active ? [...active].sort().join('|') : '') + '#' + (hot ? [...hot].sort().join(',') : '');

  // compute where the camera should be
  useEffect(() => {
    if (!size) return;
    const { cw, ch } = size;
    const aspect = ch / cw;
    const whole = (): Box => {
      // fit the whole diagram, centred, with the container's aspect ratio
      const w = Math.max(L.W, L.H / aspect), h = w * aspect;
      return { x: (L.W - w) / 2, y: (L.H - h) / 2, w, h };
    };
    if (!zoomable || fitAll) {
      goal.current = whole();
      return animate(!svgRef.current?.getAttribute('data-ready'));
    }
    if (!follow) return;
    const scale = Math.min(MAX_PX_PER_UNIT, Math.max(MIN_PX_PER_UNIT, fitScale));
    let w = cw / scale, h = ch / scale;
    const nodes = L.nodes.filter((n) => active?.has(n.id));
    let pts = nodes.length ? nodes : L.nodes.filter((n) => n.id === spec.start);
    if (!pts.length) { goal.current = whole(); return animate(); }
    const bbox = (ps: typeof pts) => ({
      minX: Math.min(...ps.map((n) => n.x - n.r)) - FOCUS_PAD, maxX: Math.max(...ps.map((n) => n.x + n.r)) + FOCUS_PAD,
      minY: Math.min(...ps.map((n) => n.y - n.r)) - FOCUS_PAD, maxY: Math.max(...ps.map((n) => n.y + n.r)) + FOCUS_PAD,
    });
    let b = bbox(pts);
    // If the live states are spread too far apart (e.g. many parallel worlds), don't zoom out to nothing:
    // stay readable and follow the state(s) the latest transition just entered.
    if (Math.max((b.maxX - b.minX) / w, (b.maxY - b.minY) / h) > 1.3) {
      const entered = new Set([...(hot ?? [])].map((g) => L.edges[g]?.to));
      const focus = pts.filter((n) => entered.has(n.id));
      pts = focus.length ? focus : [pts[pts.length - 1]];
      b = bbox(pts);
    }
    const { minX, maxX, minY, maxY } = b;
    // zoom out only as much as needed (at most 30%) to keep the focus states together
    const need = Math.min(1.3, Math.max((maxX - minX) / w, (maxY - minY) / h, 1));
    w *= need; h *= need;
    const W = whole();
    if (w >= W.w) { goal.current = W; return animate(); }
    const clamp = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)));
    const x = clamp((minX + maxX) / 2 - w / 2, -20, L.W + 20 - w);
    const y = clamp((minY + maxY) / 2 - h / 2, -20, L.H + 20 - h);
    goal.current = { x, y, w, h };
    animate(!svgRef.current?.getAttribute('data-ready'));
  }, [size, zoomable, fitAll, follow, activeKey, L, fitScale, spec.start, animate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (size) svgRef.current?.setAttribute('data-ready', '1'); }, [size]);

  // drag to pan
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!zoomable || fitAll || e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || !size) return;
    const k = cam.current.w / size.cw;
    const dx = (e.clientX - d.x) * k, dy = (e.clientY - d.y) * k;
    if (follow && Math.abs(dx) + Math.abs(dy) < 3 * k) return;
    drag.current = { ...d, x: e.clientX, y: e.clientY };
    if (follow) setFollow(false);
    cancelAnimationFrame(raf.current);
    cam.current = { ...cam.current, x: cam.current.x - dx, y: cam.current.y - dy };
    goal.current = cam.current;
    svgRef.current?.setAttribute('viewBox', `${cam.current.x} ${cam.current.y} ${cam.current.w} ${cam.current.h}`);
  };
  const endDrag = () => { drag.current = null; };

  return (
    <div
      ref={wrapRef}
      className={`canvas${zoomable && !fitAll ? ' pannable' : ''}`}
      style={size ? { height: size.ch } : { aspectRatio: `${L.W} / ${L.H}` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <svg ref={svgRef} viewBox={`0 0 ${L.W} ${L.H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={label ?? 'State diagram'}>
        <DiagramMarks L={L} uid={uid} active={active} hot={hot} />
      </svg>
      {zoomable && (
        <div className="cam-tools">
          {!follow && !fitAll && (
            <button type="button" className="cam-btn" onClick={() => setFollow(true)} aria-label="Follow the active state" title="Follow">
              <Icon name="crosshair" />
            </button>
          )}
          <button type="button" className="cam-btn" onClick={() => { setFitAll((f) => !f); setFollow(true); }} aria-label={fitAll ? 'Zoom in and follow' : 'Show the whole machine'} title={fitAll ? 'Zoom in' : 'Fit all'}>
            <Icon name={fitAll ? 'expand' : 'shrink'} />
          </button>
        </div>
      )}
    </div>
  );
}
