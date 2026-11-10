'use client';

import { useEffect, useRef, useState } from 'react';
import type { IconName } from '../Icon';
import { Segmented } from '../machines/Controls';
import { FASim } from '../machines/FASim';
import { PDASim } from '../machines/PDASim';
import { TMSim } from '../machines/TMSim';
import { div3, dpdaBrackets, lbaAnBnCn, tmIncrement } from '@/content/specs';

const TABS: { id: string; label: string; icon: IconName; memory: string }[] = [
  { id: 'fa', label: 'Finite', icon: 'dfa', memory: 'remembers only its current state' },
  { id: 'pda', label: 'Pushdown', icon: 'stack', memory: 'adds a stack of plates' },
  { id: 'lba', label: 'Bounded', icon: 'bounded', memory: 'rewrites a tape no longer than the input' },
  { id: 'tm', label: 'Turing', icon: 'tape', memory: 'has an endless tape it can read and write' },
];

/**
 * All four machines are mounted in the same grid cell, so the pane is always as tall as the
 * tallest one and switching tabs never changes its height. A running maximum (reset only when the
 * width changes) also absorbs small height changes while a machine runs. Without this, the hero's
 * centred text column would jump every time the pane resized.
 */
export function HeroPlayground() {
  const [tab, setTab] = useState<string>('fa');
  const stackRef = useRef<HTMLDivElement>(null);
  const [minH, setMinH] = useState(0);

  useEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    let width = 0;
    let max = 0;
    const ro = new ResizeObserver(() => {
      const w = Math.round(el.clientWidth);
      const h = Math.max(...[...el.children].map((c) => (c as HTMLElement).offsetHeight));
      // a new width means a new layout: start the running maximum again
      if (w !== width) { width = w; max = h; setMinH(h); return; }
      if (h > max) { max = h; setMinH(h); }
    });
    ro.observe(el);
    [...el.children].forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, []);

  const pane = (id: string, node: React.ReactNode) => (
    <div className={`pane-slot${tab === id ? ' on' : ''}`} inert={tab !== id}>
      {node}
    </div>
  );

  return (
    <div className="hero-pane glass">
      <div className="pane-top">
        <div className="traffic" aria-hidden="true"><i /><i /><i /></div>
      </div>
      <div className="pane-seg">
        <Segmented label="Choose a machine" value={tab} onChange={setTab} options={TABS.map((x) => ({ value: x.id, label: x.label, icon: x.icon }))} />
      </div>
      <div className="pane-stack" ref={stackRef} style={minH ? { minHeight: minH } : undefined}>
        {pane('fa',
          <FASim spec={div3} initial="1001" presets={['110', '1001', '111', '10010']} autoplay={tab === 'fa'} hideTrace
            title="Is this binary number divisible by 3?" caption={<>A <b>finite automaton</b> {TABS[0].memory}: the remainder so far, 0, 1 or 2.</>} />)}
        {pane('pda',
          <PDASim spec={dpdaBrackets} initial="(()())" presets={['(())', '()()', '(()', '())(']} autoplay={tab === 'pda'}
            title="Are these brackets balanced?" caption={<>A <b>pushdown automaton</b> {TABS[1].memory}: push on <code className="inline-code">(</code>, pop on <code className="inline-code">)</code>.</>} />)}
        {pane('lba',
          <TMSim spec={lbaAnBnCn} initial="aabbcc" presets={['abc', 'aabbcc', 'aabbc', 'abcabc']} autoplay={tab === 'lba'} speed={160}
            title="Equal numbers of a, b and c?" caption={<>A <b>linear bounded automaton</b> {TABS[2].memory}. The dark cells are fences it can never cross.</>} />)}
        {pane('tm',
          <TMSim spec={tmIncrement} initial="1011" presets={['1011', '111', '1000']} autoplay={tab === 'tm'} speed={380}
            title="Add one to a binary number" caption={<>A <b>Turing machine</b> {TABS[3].memory}, which is enough to run any algorithm.</>} />)}
      </div>
    </div>
  );
}
