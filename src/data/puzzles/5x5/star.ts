import type { PuzzleDefinition } from '../../../engine/types';
import { deriveRowClues, deriveColClues } from '../../../engine/clues';

// prettier-ignore
const solution = [
  0, 0, 1, 0, 0, // . . ★ . .
  0, 1, 1, 1, 0, // . ★ ★ ★ .
  1, 1, 1, 1, 1, // ★ ★ ★ ★ ★
  0, 1, 1, 1, 0, // . ★ ★ ★ .
  0, 0, 1, 0, 0, // . . ★ . .
];

const size = 5;

export const star: PuzzleDefinition = {
  id: 'star-5x5',
  title: 'Star',
  size,
  solution,
  rowClues: deriveRowClues(solution, size),
  colClues: deriveColClues(solution, size),
  difficulty: 'blue',
  description: 'A shining star',
  source: 'bundled',
};
