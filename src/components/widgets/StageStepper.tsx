'use client';

import type { ReactNode } from 'react';
import type { MachineSpec } from '@/lib/machines';
import { StateDiagram } from '../machines/StateDiagram';
import { Panel, Transport } from '../machines/Controls';
import { useStepper } from '../machines/useAutoplay';
import { roman } from '@/lib/site';

export interface Stage {
  spec: MachineSpec;
  title: string;
  note: ReactNode;
  /** states to highlight as "new" or "being removed" in this stage */
  focus?: string[];
}

/** Walk through a construction (Thompson, state elimination, …) one stage at a time. */
export function StageStepper({ stages, title, tag = 'Step through', caption }: { stages: Stage[]; title: ReactNode; tag?: string; caption?: ReactNode }) {
  const s = useStepper(stages.length - 1, 2200);
  const st = stages[Math.min(s.k, stages.length - 1)];
  return (
    <Panel tag={tag} title={title} caption={caption}>
      <div className="stage-head">
        <span className="roman">{roman(s.k + 1)}.</span>
        <b>{st.title}</b>
      </div>
      <StateDiagram spec={st.spec} active={new Set(st.focus ?? [])} />
      <div className="stage-note">{st.note}</div>
      <Transport s={s} stepWord="stage" />
    </Panel>
  );
}
