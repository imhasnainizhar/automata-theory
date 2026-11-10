import type { ComponentType } from 'react';
import Introduction from './introduction';
import Foundations from './foundations';
import Intuition from './intuition';
import DFA from './dfa';
import NFA from './nfa';
import DPDA from './dpda';
import NPDA from './npda';
import LBA from './lba';
import DTM from './dtm';
import NTM from './ntm';
import BigPicture from './big-picture';

export const CHAPTER_CONTENT: Record<string, ComponentType> = {
  introduction: Introduction,
  foundations: Foundations,
  intuition: Intuition,
  dfa: DFA,
  nfa: NFA,
  dpda: DPDA,
  npda: NPDA,
  lba: LBA,
  dtm: DTM,
  ntm: NTM,
  'big-picture': BigPicture,
};
