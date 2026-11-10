import type { IconName } from '@/components/Icon';

export type Section = { id: string; title: string };
export type Chapter = {
  slug: string;
  title: string;
  short: string;
  group: string;
  icon: IconName;
  blurb: string;
  sections: Section[];
};

/** The fixed eight-part template used by every machine chapter. */
export const MACHINE_SECTIONS: Section[] = [
  { id: 'intuition', title: 'Intuition' },
  { id: 'visual-machine', title: 'Visual machine' },
  { id: 'execution', title: 'Execution' },
  { id: 'formal-definition', title: 'Formal definition' },
  { id: 'corresponding-language', title: 'Corresponding language' },
  { id: 'grammar-connection', title: 'Grammar connection' },
  { id: 'limitations', title: 'Limitations' },
  { id: 'exercises', title: 'Exercises' },
];

export const CHAPTERS: Chapter[] = [
  {
    slug: 'introduction',
    title: 'Introduction',
    short: 'Introduction',
    group: 'Begin',
    icon: 'compass',
    blurb: 'What automata are, why computer scientists study them, and how this course is organised.',
    sections: [
      { id: 'what-is-an-automaton', title: 'What is an automaton?' },
      { id: 'memory-is-everything', title: 'Memory is everything' },
      { id: 'four-machines', title: 'The four machines' },
      { id: 'why-it-matters', title: 'Why it matters' },
      { id: 'how-to-use', title: 'How to use this course' },
    ],
  },
  {
    slug: 'foundations',
    title: 'Formal Languages & Foundations',
    short: 'Foundations',
    group: 'Begin',
    icon: 'sigma',
    blurb: 'Alphabets, strings and languages; operations on them; grammars; and the Chomsky hierarchy.',
    sections: [
      { id: 'alphabets-and-strings', title: 'Alphabets & strings' },
      { id: 'languages', title: 'Languages' },
      { id: 'operations', title: 'Operations on languages' },
      { id: 'problems-as-languages', title: 'Problems as languages' },
      { id: 'grammars', title: 'Grammars' },
      { id: 'chomsky-hierarchy', title: 'The Chomsky hierarchy' },
    ],
  },
  {
    slug: 'intuition',
    title: 'Automata Intuition',
    short: 'Intuition',
    group: 'Begin',
    icon: 'sprout',
    blurb: 'States, transitions and input through hands-on examples — including the control unit of a CPU.',
    sections: [
      { id: 'states-and-transitions', title: 'States & transitions' },
      { id: 'reading-input', title: 'Reading input' },
      { id: 'cpu-control-unit', title: 'A CPU is a state machine' },
      { id: 'determinism', title: 'Determinism vs. nondeterminism' },
      { id: 'adding-memory', title: 'Adding memory' },
    ],
  },
  {
    slug: 'dfa',
    title: 'Deterministic Finite Automata',
    short: 'DFA',
    group: 'Finite Automata',
    icon: 'dfa',
    blurb: 'Machines with a fixed, finite memory and exactly one move at every step. They recognise the regular languages.',
    sections: MACHINE_SECTIONS,
  },
  {
    slug: 'nfa',
    title: 'Nondeterministic Finite Automata',
    short: 'NFA',
    group: 'Finite Automata',
    icon: 'nfa',
    blurb: 'Finite automata that may guess, including ε-moves. They are easier to design and recognise the same languages as DFAs.',
    sections: MACHINE_SECTIONS,
  },
  {
    slug: 'dpda',
    title: 'Deterministic Pushdown Automata',
    short: 'DPDA',
    group: 'Pushdown Automata',
    icon: 'stack',
    blurb: 'A finite control plus one stack, with no guessing. These are the machines behind real parsers.',
    sections: MACHINE_SECTIONS,
  },
  {
    slug: 'npda',
    title: 'Nondeterministic Pushdown Automata',
    short: 'NPDA',
    group: 'Pushdown Automata',
    icon: 'stackTree',
    blurb: 'Stack machines that can guess. They recognise exactly the context-free languages.',
    sections: MACHINE_SECTIONS,
  },
  {
    slug: 'lba',
    title: 'Linear Bounded Automata',
    short: 'LBA',
    group: 'Linear Bounded Automata',
    icon: 'bounded',
    blurb: 'Turing machines confined to the cells their input occupies. They recognise the context-sensitive languages.',
    sections: MACHINE_SECTIONS,
  },
  {
    slug: 'dtm',
    title: 'Deterministic Turing Machines',
    short: 'DTM',
    group: 'Turing Machines',
    icon: 'tape',
    blurb: 'An unbounded read/write tape — the model of every algorithm.',
    sections: MACHINE_SECTIONS,
  },
  {
    slug: 'ntm',
    title: 'Nondeterministic Turing Machines',
    short: 'NTM',
    group: 'Turing Machines',
    icon: 'branch',
    blurb: 'Turing machines that branch: no more powerful, but at the heart of P vs NP.',
    sections: MACHINE_SECTIONS,
  },
  {
    slug: 'big-picture',
    title: 'The Big Picture',
    short: 'Big Picture',
    group: 'Synthesis',
    icon: 'rings',
    blurb: 'All four machines side by side: determinism compared, what each machine can decide, and what comes next.',
    sections: [
      { id: 'hierarchy-map', title: 'The hierarchy, assembled' },
      { id: 'determinism-compared', title: 'Determinism, compared' },
      { id: 'decidability', title: 'What can be decided' },
      { id: 'complexity', title: 'A glimpse of complexity' },
      { id: 'where-next', title: 'Where to go next' },
    ],
  },
];

export const getChapter = (slug: string) => CHAPTERS.find((c) => c.slug === slug);
export const chapterIndex = (slug: string) => CHAPTERS.findIndex((c) => c.slug === slug);
export const GROUPS = Array.from(new Set(CHAPTERS.map((c) => c.group)));
