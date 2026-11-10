export const site = {
  name: 'WhatAutomata',
  tagline: 'Learn automata theory by playing with machines.',
  description:
    'An open, intuition-first course on automata theory. Run finite, pushdown, linear-bounded and Turing machines in your browser, and see how each one matches a class of formal languages.',
  repo: 'imhasnainizhar/automata-theory',
  get repoUrl() {
    return `https://github.com/${this.repo}`;
  },
  author: 'Hasnain Izhar',
  year: 2026,
};

const ROMAN: [number, string][] = [
  [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'], [90, 'xc'],
  [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
];

/** 1 → "i", 4 → "iv", 12 → "xii" */
export function roman(n: number): string {
  let out = '';
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v; }
  return out;
}
