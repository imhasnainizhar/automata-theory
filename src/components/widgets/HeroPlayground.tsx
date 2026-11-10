'use client';

import { useState } from 'react';
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

export function HeroPlayground() {
  const [tab, setTab] = useState<string>('fa');
  const t = TABS.find((x) => x.id === tab)!;
  return (
    <div className="hero-pane glass">
      <div className="pane-top">
        <div className="traffic" aria-hidden="true"><i /><i /><i /></div>
      </div>
      <div className="pane-seg">
        <Segmented label="Choose a machine" value={tab} onChange={setTab} options={TABS.map((x) => ({ value: x.id, label: x.label, icon: x.icon }))} />
      </div>
      <div key={tab}>
        {tab === 'fa' && (
          <FASim spec={div3} initial="1001" presets={['110', '1001', '111', '10010']} autoplay hideTrace
            title="Is this binary number divisible by 3?" caption={<>A <b>finite automaton</b> {t.memory}: the remainder so far, 0, 1 or 2.</>} />
        )}
        {tab === 'pda' && (
          <PDASim spec={dpdaBrackets} initial="(()())" presets={['(())', '()()', '(()', '())(']} autoplay
            title="Are these brackets balanced?" caption={<>A <b>pushdown automaton</b> {t.memory}: push on <code className="inline-code">(</code>, pop on <code className="inline-code">)</code>.</>} />
        )}
        {tab === 'lba' && (
          <TMSim spec={lbaAnBnCn} initial="aabbcc" presets={['abc', 'aabbcc', 'aabbc', 'abcabc']} autoplay speed={160}
            title="Equal numbers of a, b and c?" caption={<>A <b>linear bounded automaton</b> {t.memory}. The dark cells are fences it can never cross.</>} />
        )}
        {tab === 'tm' && (
          <TMSim spec={tmIncrement} initial="1011" presets={['1011', '111', '1000']} autoplay speed={380}
            title="Add one to a binary number" caption={<>A <b>Turing machine</b> {t.memory}, which is enough to run any algorithm.</>} />
        )}
      </div>
    </div>
  );
}
