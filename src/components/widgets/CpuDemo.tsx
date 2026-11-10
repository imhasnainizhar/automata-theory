'use client';

import { useMemo, useState } from 'react';
import { StateDiagram } from '../machines/StateDiagram';
import { Panel } from '../machines/Controls';
import { useAutoplay } from '../machines/useAutoplay';
import { Icon } from '../Icon';
import { cpuControl } from '@/content/specs';

type Instr = { op: 'LOAD' | 'SUB' | 'JNZ' | 'HALT'; arg?: number };
const PROGRAM: Instr[] = [{ op: 'LOAD', arg: 6 }, { op: 'SUB', arg: 2 }, { op: 'JNZ', arg: 1 }, { op: 'HALT' }];
const fmt = (i: Instr) => (i.arg === undefined ? i.op : `${i.op} ${i.arg}`);

type Part = 'mem' | 'pc' | 'ir' | 'cu' | 'alu' | 'acc';
interface Frame { addr: number; phase: 'Fetch' | 'Decode' | 'Execute' | 'Halt'; pc: number; ir: string; acc: number; focus: Part[]; note: string }

const PARTS: { id: Part; name: string; color: string; text: string }[] = [
  { id: 'mem', name: 'Memory', color: 'var(--teal)', text: 'Holds the program. Each numbered cell contains one instruction.' },
  { id: 'pc', name: 'Program counter', color: 'var(--moss)', text: 'The address of the next instruction to fetch. Jumps simply overwrite it.' },
  { id: 'ir', name: 'Instruction register', color: 'var(--plum)', text: 'A copy of the instruction currently being worked on.' },
  { id: 'cu', name: 'Control unit', color: 'var(--clay)', text: 'A finite-state machine: Fetch → Decode → Execute, again and again. This is the automaton.' },
  { id: 'alu', name: 'ALU', color: 'var(--ochre)', text: 'The arithmetic-logic unit. It does the actual subtracting and comparing.' },
  { id: 'acc', name: 'Accumulator', color: 'var(--ink-2)', text: 'The working register that holds the current result.' },
];

function simulate(): Frame[] {
  const frames: Frame[] = [{ addr: 0, phase: 'Fetch', pc: 0, ir: '—', acc: 0, focus: ['cu'], note: 'Power on. The control unit starts in its Fetch state with PC = 0.' }];
  let pc = 0, acc = 0, ir = '—';
  for (let guard = 0; guard < 40; guard++) {
    const addr = pc;
    const ins = PROGRAM[pc];
    ir = fmt(ins);
    pc += 1;
    frames.push({ addr, phase: 'Fetch', pc, ir, acc, focus: ['mem', 'ir', 'pc'], note: `Fetch: copy memory[${pc - 1}] into IR, then advance PC to ${pc}.` });
    if (ins.op === 'HALT') {
      frames.push({ addr, phase: 'Halt', pc, ir, acc, focus: ['cu'], note: 'Decode sees HALT, so the control unit enters its final state and stops.' });
      break;
    }
    frames.push({ addr, phase: 'Decode', pc, ir, acc, focus: ['cu', 'ir'], note: `Decode: the control unit reads the opcode ${ins.op} and decides which wires to activate.` });
    if (ins.op === 'LOAD') { acc = ins.arg!; frames.push({ addr, phase: 'Execute', pc, ir, acc, focus: ['acc'], note: `Execute: put ${acc} into the accumulator.` }); }
    else if (ins.op === 'SUB') { acc -= ins.arg!; frames.push({ addr, phase: 'Execute', pc, ir, acc, focus: ['alu', 'acc'], note: `Execute: the ALU computes ${acc + ins.arg!} − ${ins.arg} = ${acc}.` }); }
    else if (ins.op === 'JNZ') {
      if (acc !== 0) { pc = ins.arg!; frames.push({ addr, phase: 'Execute', pc, ir, acc, focus: ['alu', 'pc'], note: `Execute: ACC = ${acc} ≠ 0, so jump. PC is overwritten with ${pc}.` }); }
      else frames.push({ addr, phase: 'Execute', pc, ir, acc, focus: ['alu'], note: 'Execute: ACC = 0, so do not jump. Fall through to the next instruction.' });
    }
  }
  return frames;
}

export function CpuDemo() {
  const frames = useMemo(simulate, []);
  const [k, setK] = useState(0);
  const last = frames.length - 1;
  const [playing, setPlaying] = useAutoplay(() => {
    if (k >= last) return false;
    setK(k + 1);
    return k + 1 < last;
  }, 900);
  const f = frames[k];
  const focus = new Set(f.focus);

  return (
    <Panel tag="Interactive" title="Inside a CPU: the control unit is a state machine"
      caption="The program counts down from 6 in steps of 2. Watch the control unit cycle through its three states, which is exactly how a finite automaton moves between states.">
      <div className="cpu-grid">
        <StateDiagram spec={cpuControl} active={new Set([f.phase])} label="Control-unit state machine" />
        <div>
          <div className="reg-row">
            <div className={`reg${focus.has('pc') ? ' flash' : ''}`}><small>PC</small><span>{f.pc}</span></div>
            <div className={`reg${focus.has('ir') ? ' flash' : ''}`}><small>IR</small><span style={{ fontSize: 14 }}>{f.ir}</span></div>
            <div className={`reg${focus.has('acc') || focus.has('alu') ? ' flash' : ''}`}><small>ACC</small><span>{f.acc}</span></div>
          </div>
          <div className="mem" aria-label="Memory">
            {PROGRAM.map((ins, i) => (
              <div key={i} className={`mem-row${f.addr === i ? ' pc' : ''}`}>
                <small>[{i}]</small>
                <span>{fmt(ins)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="controls">
        <button type="button" className="pill-btn" onClick={() => { setK(0); setPlaying(false); }}><Icon name="reset" /> Reset</button>
        <button type="button" className="pill-btn" disabled={k >= last} onClick={() => setK(Math.min(k + 1, last))}><Icon name="step" /> Clock tick</button>
        <button type="button" className="pill-btn primary" onClick={() => (playing ? setPlaying(false) : (k >= last && setK(0), setPlaying(true)))}>
          <Icon name={playing ? 'pause' : 'play'} /> {playing ? 'Pause' : 'Run'}
        </button>
      </div>
      <div className="status" aria-live="polite"><b>{f.phase}.</b> {f.note}</div>
      <div className="explain">
        {PARTS.map((p) => (
          <div key={p.id} className={`explain-item${focus.has(p.id) ? ' on' : ''}`}>
            <b><span className="dot" style={{ background: p.color }} />{p.name}</b>
            {p.text}
          </div>
        ))}
      </div>
    </Panel>
  );
}
