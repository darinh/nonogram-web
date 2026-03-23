import type { PuzzleDefinition } from '../../../engine/types';
import { deriveRowClues, deriveColClues } from '../../../engine/clues';

// prettier-ignore
const solution = [
  0, 0, 0, 0, 1, 1, 0, 0, 0, 0, //         ■ ■            treetop
  0, 0, 0, 1, 1, 1, 1, 0, 0, 0, //       ■ ■ ■ ■
  0, 0, 1, 1, 1, 1, 1, 1, 0, 0, //     ■ ■ ■ ■ ■ ■
  0, 0, 0, 1, 1, 1, 1, 0, 0, 0, //       ■ ■ ■ ■          mid layer
  0, 1, 1, 1, 1, 1, 1, 1, 1, 0, //   ■ ■ ■ ■ ■ ■ ■ ■
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  0, 0, 0, 0, 1, 1, 0, 0, 0, 0, //         ■ ■            trunk
  0, 0, 0, 0, 1, 1, 0, 0, 0, 0, //         ■ ■
  0, 0, 0, 0, 1, 1, 0, 0, 0, 0, //         ■ ■
  0, 0, 1, 1, 1, 1, 1, 1, 0, 0, //     ■ ■ ■ ■ ■ ■       ground
];

const size = 10;

export const tree: PuzzleDefinition = {
  id: 'tree-10x10',
  title: 'Tree',
  size,
  solution,
  rowClues: deriveRowClues(solution, size),
  colClues: deriveColClues(solution, size),
  difficulty: 'orange',
  description: 'A tall evergreen tree',
  source: 'bundled',
};
