import type { PuzzleDefinition } from '../../../engine/types';
import { deriveRowClues, deriveColClues } from '../../../engine/clues';

// prettier-ignore
const solution = [
  0, 0, 0, 0, 1, 1, 0, 0, 0, 0, //         ■ ■
  0, 0, 0, 1, 1, 1, 1, 0, 0, 0, //       ■ ■ ■ ■
  0, 0, 1, 1, 1, 1, 1, 1, 0, 0, //     ■ ■ ■ ■ ■ ■
  0, 1, 1, 1, 1, 1, 1, 1, 1, 0, //   ■ ■ ■ ■ ■ ■ ■ ■
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  1, 1, 1, 0, 0, 0, 0, 1, 1, 1, // ■ ■ ■ . . . . ■ ■ ■
  1, 1, 1, 0, 0, 0, 0, 1, 1, 1, // ■ ■ ■ . . . . ■ ■ ■
  1, 1, 1, 0, 1, 1, 0, 1, 1, 1, // ■ ■ ■ . ■ ■ . ■ ■ ■
  1, 1, 1, 0, 1, 1, 0, 1, 1, 1, // ■ ■ ■ . ■ ■ . ■ ■ ■
];

const size = 10;

export const house: PuzzleDefinition = {
  id: 'house-10x10',
  title: 'House',
  size,
  solution,
  rowClues: deriveRowClues(solution, size),
  colClues: deriveColClues(solution, size),
  difficulty: 'yellow',
  description: 'A cozy house with a door',
  source: 'bundled',
};
