import type { PuzzleDefinition } from '../../../engine/types';
import { deriveRowClues, deriveColClues } from '../../../engine/clues';

// prettier-ignore
const solution = [
  1, 0, 0, 0, 0, 0, 0, 0, 0, 1, // ■ . . . . . . . . ■  ears
  1, 1, 0, 0, 0, 0, 0, 0, 1, 1, // ■ ■ . . . . . . ■ ■
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // ■ ■ ■ ■ ■ ■ ■ ■ ■ ■  head
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  1, 0, 1, 0, 1, 1, 0, 1, 0, 1, // ■ . ■ . ■ ■ . ■ . ■  eyes
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  1, 1, 0, 1, 1, 1, 1, 0, 1, 1, // ■ ■ . ■ ■ ■ ■ . ■ ■  mouth
  0, 1, 1, 1, 1, 1, 1, 1, 1, 0, // . ■ ■ ■ ■ ■ ■ ■ ■ .
  0, 0, 1, 1, 0, 0, 1, 1, 0, 0, // . . ■ ■ . . ■ ■ . .  whiskers
  0, 0, 0, 1, 0, 0, 1, 0, 0, 0, // . . . ■ . . ■ . . .
];

const size = 10;

export const cat: PuzzleDefinition = {
  id: 'cat-10x10',
  title: 'Cat',
  size,
  solution,
  rowClues: deriveRowClues(solution, size),
  colClues: deriveColClues(solution, size),
  difficulty: 'medium',
  description: 'A curious cat face',
  source: 'bundled',
};
