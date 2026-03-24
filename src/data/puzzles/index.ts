import type { PuzzleDefinition } from '../../engine/types';
import { heart } from './5x5/heart';
import { star } from './5x5/star';
import { arrow } from './5x5/arrow';
import { house } from './10x10/house';
import { cat } from './10x10/cat';
import { tree } from './10x10/tree';
import { rocket } from './15x15/rocket';
import { flower } from './15x15/flower';
import { gamepad } from './15x15/gamepad';

import { themePuzzles } from '../themes/theme-puzzles';

export const bundledPuzzles: PuzzleDefinition[] = [
  heart,
  star,
  arrow,
  house,
  cat,
  tree,
  rocket,
  flower,
  gamepad,
  ...themePuzzles,
];
