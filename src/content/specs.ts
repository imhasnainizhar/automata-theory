import type { MachineSpec } from '@/lib/machines';

/* ------------------------------------------------------------ intuition */

export const turnstile: MachineSpec = {
  kind: 'dfa', w: 520, h: 200, start: 'Locked', accept: ['Open'],
  states: { Locked: [150, 115], Open: [370, 115] },
  edges: [['Locked', 'Open', 'c'], ['Open', 'Locked', 'p'], ['Locked', 'Locked', 'p', null, 'up'], ['Open', 'Open', 'c', null, 'up']],
};

export const vending: MachineSpec = {
  kind: 'dfa', w: 620, h: 270, start: 'c0', accept: ['c15'], dead: ['x'],
  states: { c0: [70, 120], c5: [220, 60], c10: [370, 120], c15: [520, 60], x: [520, 210] },
  edges: [
    ['c0', 'c5', 'n'], ['c0', 'c10', 'd', 0.25], ['c5', 'c10', 'n'], ['c5', 'c15', 'd', -0.12],
    ['c10', 'c15', 'n'], ['c10', 'x', 'd'], ['c15', 'x', 'n,d'], ['x', 'x', 'n,d', null, 'right'],
  ],
};

export const cpuControl: MachineSpec = {
  kind: 'static', w: 560, h: 250, start: 'Fetch', accept: ['Halt'],
  states: { Fetch: [110, 80], Decode: [330, 80], Execute: [220, 200], Halt: [480, 190] },
  edges: [['Fetch', 'Decode', 'clock'], ['Decode', 'Execute', 'opcode'], ['Execute', 'Fetch', 'done'], ['Decode', 'Halt', 'HALT']],
};

/* ------------------------------------------------------------- finite */

export const div3: MachineSpec = {
  kind: 'dfa', w: 520, h: 200, start: 'r0', accept: ['r0'],
  states: { r0: [110, 112], r1: [260, 112], r2: [410, 112] },
  edges: [['r0', 'r0', '0', null, 'up'], ['r0', 'r1', '1'], ['r1', 'r0', '1'], ['r1', 'r2', '0'], ['r2', 'r1', '0'], ['r2', 'r2', '1', null, 'up']],
};

export const ends01: MachineSpec = {
  kind: 'dfa', w: 520, h: 250, start: 'q0', accept: ['q2'],
  states: { q0: [90, 112], q1: [260, 112], q2: [430, 112] },
  edges: [['q0', 'q1', '0'], ['q0', 'q0', '1', null, 'up'], ['q1', 'q1', '0', null, 'up'], ['q1', 'q2', '1'], ['q2', 'q1', '0'], ['q2', 'q0', '1', -0.42]],
};

export const evenZeros: MachineSpec = {
  kind: 'dfa', w: 520, h: 200, start: 'Even', accept: ['Even'],
  states: { Even: [150, 112], Odd: [370, 112] },
  edges: [['Even', 'Odd', '0'], ['Odd', 'Even', '0'], ['Even', 'Even', '1', null, 'up'], ['Odd', 'Odd', '1', null, 'up']],
};

export const ends01NFA: MachineSpec = {
  kind: 'nfa', w: 520, h: 190, start: 'q0', accept: ['q2'],
  states: { q0: [100, 112], q1: [260, 112], q2: [420, 112] },
  edges: [['q0', 'q0', '0,1', null, 'up'], ['q0', 'q1', '0'], ['q1', 'q2', '1']],
};

export const thirdFromLast: MachineSpec = {
  kind: 'nfa', w: 560, h: 190, start: 'q0', accept: ['q3'],
  states: { q0: [80, 112], q1: [210, 112], q2: [340, 112], q3: [470, 112] },
  edges: [['q0', 'q0', '0,1', null, 'up'], ['q0', 'q1', '1'], ['q1', 'q2', '0,1'], ['q2', 'q3', '0,1']],
};

export const twoOrThree: MachineSpec = {
  kind: 'nfa', w: 560, h: 340, start: 's', accept: ['a0', 'b0'],
  states: { s: [70, 170], a0: [220, 75], a1: [400, 75], b0: [220, 245], b1: [400, 245], b2: [310, 305] },
  edges: [['s', 'a0', 'ε'], ['s', 'b0', 'ε'], ['a0', 'a1', '0'], ['a1', 'a0', '0'], ['b0', 'b1', '0', -0.1], ['b1', 'b2', '0'], ['b2', 'b0', '0']],
};

export const subsetDFA: MachineSpec = {
  kind: 'dfa', w: 580, h: 250, start: '{q0}', accept: ['{q0,q2}'],
  states: { '{q0}': [90, 112], '{q0,q1}': [290, 112], '{q0,q2}': [490, 112] },
  edges: [
    ['{q0}', '{q0}', '1', null, 'up'], ['{q0}', '{q0,q1}', '0'], ['{q0,q1}', '{q0,q1}', '0', null, 'up'],
    ['{q0,q1}', '{q0,q2}', '1'], ['{q0,q2}', '{q0,q1}', '0'], ['{q0,q2}', '{q0}', '1', -0.42],
  ],
};

export const lexerDFA: MachineSpec = {
  kind: 'static', w: 600, h: 300, start: 'S',
  accept: ['ID', 'NUM', 'OP', 'PUNC'],
  states: { S: [110, 150], ID: [330, 50], NUM: [460, 150], OP: [330, 250], PUNC: [180, 265] },
  edges: [
    ['S', 'ID', 'letter'], ['ID', 'ID', 'letter,digit', null, 'right'],
    ['S', 'NUM', 'digit'], ['NUM', 'NUM', 'digit', null, 'right'],
    ['S', 'OP', '+ - * / ='], ['S', 'PUNC', '( ) ;'], ['S', 'S', 'space', null, 'left'],
  ],
};

/* ----------------------------------------------------------- pushdown */

export const dpda0n1n: MachineSpec = {
  kind: 'pda', w: 620, h: 200, start: 'q1', accept: ['q1', 'q4'],
  states: { q1: [70, 125], q2: [220, 125], q3: [390, 125], q4: [550, 125] },
  edges: [['q1', 'q2', 'ε,ε→⊥'], ['q2', 'q2', '0,ε→0', null, 'up'], ['q2', 'q3', '1,0→ε'], ['q3', 'q3', '1,0→ε', null, 'up'], ['q3', 'q4', 'ε,⊥→ε']],
};

/** Deterministic: q0 = balanced (accepting), q1 = something open, q2 = just closed, check the top. */
export const dpdaBrackets: MachineSpec = {
  kind: 'pda', w: 600, h: 270, start: 's', accept: ['q0'],
  states: { s: [60, 130], q0: [190, 130], q1: [400, 130], q2: [400, 235] },
  edges: [
    ['s', 'q0', 'ε,ε→⊥'], ['q0', 'q1', '(,⊥→(⊥'], ['q1', 'q1', '(,(→((', null, 'up'],
    ['q1', 'q2', '),(→ε', 0.25], ['q2', 'q1', 'ε,(→(', 0.25], ['q2', 'q0', 'ε,⊥→⊥'],
  ],
};

export const dpdaWcw: MachineSpec = {
  kind: 'pda', w: 620, h: 220, start: 'q1', accept: ['q4'],
  states: { q1: [70, 140], q2: [220, 140], q3: [390, 140], q4: [550, 140] },
  edges: [['q1', 'q2', 'ε,ε→⊥'], ['q2', 'q2', 'a,ε→a;b,ε→b', null, 'up'], ['q2', 'q3', 'c,ε→ε'], ['q3', 'q3', 'a,a→ε;b,b→ε', null, 'up'], ['q3', 'q4', 'ε,⊥→ε']],
};

export const npdaPal: MachineSpec = {
  kind: 'pda', w: 620, h: 220, start: 'q1', accept: ['q4'],
  states: { q1: [70, 140], q2: [220, 140], q3: [390, 140], q4: [550, 140] },
  edges: [['q1', 'q2', 'ε,ε→⊥'], ['q2', 'q2', 'a,ε→a;b,ε→b', null, 'up'], ['q2', 'q3', 'ε,ε→ε'], ['q3', 'q3', 'a,a→ε;b,b→ε', null, 'up'], ['q3', 'q4', 'ε,⊥→ε']],
};

export const npdaFromGrammar: MachineSpec = {
  kind: 'pda', w: 600, h: 250, start: 'start', accept: ['acc'],
  states: { start: [90, 180], loop: [300, 180], acc: [510, 180] },
  edges: [['start', 'loop', 'ε,ε→S⊥'], ['loop', 'loop', 'ε,S→aSb;ε,S→ε;a,a→ε;b,b→ε', null, 'up'], ['loop', 'acc', 'ε,⊥→ε']],
};

/** a^i b^j with j = i or j = 2i — needs a guess at the start. */
export const npdaOneOrTwo: MachineSpec = {
  kind: 'pda', w: 660, h: 330, start: 's', accept: ['f'],
  states: { s: [60, 160], p: [200, 160], x: [380, 80], y: [380, 245], y2: [570, 245], f: [580, 80] },
  edges: [
    ['s', 'p', 'ε,ε→⊥'], ['p', 'p', 'a,ε→a', null, 'up'],
    ['p', 'x', 'ε,ε→ε'], ['p', 'y', 'ε,ε→ε'],
    ['x', 'x', 'b,a→ε', null, 'up'], ['x', 'f', 'ε,⊥→ε'],
    ['y', 'y2', 'b,ε→ε'], ['y2', 'y', 'b,a→ε'], ['y', 'f', 'ε,⊥→ε'],
  ],
};

/* ------------------------------------------------------ linear bounded */

export const lbaAnBnCn: MachineSpec = {
  kind: 'lba', w: 680, h: 420, start: 'q0', accept: ['q_acc'],
  states: { q0: [190, 100], q1: [390, 100], q2: [590, 100], q3: [390, 250], q4: [190, 260], q_acc: [60, 370] },
  edges: [
    ['q0', 'q1', 'a→X,R'], ['q1', 'q1', 'a,Y→R', null, 'up'], ['q1', 'q2', 'b→Y,R'],
    ['q2', 'q2', 'b,Z→R', null, 'up'], ['q2', 'q3', 'c→Z,L'], ['q3', 'q3', 'a,b,Y,Z→L', null, 'down'],
    ['q3', 'q0', 'X→R'], ['q0', 'q4', 'Y→R'], ['q4', 'q4', 'Y,Z→R', null, 'down'],
    ['q4', 'q_acc', '⊣→L'], ['q0', 'q_acc', '⊣→L'],
  ],
};

/* -------------------------------------------------------------- turing */

export const tmIncrement: MachineSpec = {
  kind: 'tm', w: 560, h: 200, start: 'q0', accept: ['q_acc'],
  states: { q0: [90, 125], q1: [290, 125], q_acc: [480, 125] },
  edges: [['q0', 'q0', '0,1→R', null, 'up'], ['q0', 'q1', '␣→L'], ['q1', 'q1', '1→0,L', null, 'up'], ['q1', 'q_acc', '0→1,L;␣→1,L']],
};

export const tm0n1n: MachineSpec = {
  kind: 'tm', w: 620, h: 420, start: 'q0', accept: ['q_acc'],
  states: { q0: [230, 90], q1: [450, 90], q2: [340, 210], q3: [105, 270], q_acc: [230, 370] },
  edges: [
    ['q0', 'q1', '0→x,R'], ['q1', 'q1', '0,y→R', null, 'right'], ['q1', 'q2', '1→y,L'], ['q2', 'q2', '0,y→L', null, 'down'],
    ['q2', 'q0', 'x→R'], ['q0', 'q3', 'y→R'], ['q3', 'q3', 'y→R', null, 'left'], ['q3', 'q_acc', '␣→R'], ['q0', 'q_acc', '␣→R'],
  ],
};

/** Halts on strings of 0s; runs forever as soon as it sees a 1. */
export const tmLooper: MachineSpec = {
  kind: 'tm', w: 520, h: 200, start: 'q0', accept: ['q_acc'],
  states: { q0: [110, 125], q_acc: [300, 125], q1: [440, 125] },
  edges: [['q0', 'q0', '0→R', null, 'up'], ['q0', 'q_acc', '␣→R'], ['q0', 'q1', '1→R', 0.45], ['q1', 'q1', '0,1,␣→R', null, 'up']],
};

/** Nondeterministic: accept if the input contains 11 or ends in 0 — guess where to look. */
export const ntmGuess: MachineSpec = {
  kind: 'tm', w: 640, h: 300, start: 'q0', accept: ['q_acc'], startDir: 'up',
  states: { q0: [160, 150], q1: [350, 70], q2: [350, 230], q_acc: [550, 150] },
  edges: [
    ['q0', 'q0', '0,1→R', null, 'left'], ['q0', 'q1', '1→R'], ['q1', 'q_acc', '1→R'],
    ['q0', 'q2', '0→R'], ['q2', 'q_acc', '␣→L'],
  ],
};
