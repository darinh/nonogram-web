import type { PuzzleDefinition } from '../../../engine/types';
import { deriveRowClues, deriveColClues } from '../../../engine/clues';

// prettier-ignore
const solution = [
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, //           ■ ■ ■ ■ ■        top petal
  0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, //         ■ ■ ■ ■ ■ ■ ■
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, //           ■ ■ ■ ■ ■
  0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, //   ■ ■ . . . ■ ■ ■ . . . ■ ■  side petals
  1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, // ■ ■ ■ ■ . . ■ ■ ■ . . ■ ■ ■ ■
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, //   ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■  center
  0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, //     ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, //         ■ ■ ■ ■ ■ ■ ■      bottom petal
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, //           ■ ■ ■ ■ ■
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, //             ■ ■ ■          stem
  0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, //               ■
  0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, //               ■ . ■ ■      leaf
  0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, //               ■
  0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, //               ■
];

const size = 15;

export const flower: PuzzleDefinition = {
  id: 'flower-15x15',
  title: 'Flower',
  size,
  solution,
  rowClues: deriveRowClues(solution, size),
  colClues: deriveColClues(solution, size),
  difficulty: 'orange',
  description: 'A blooming flower with a leaf',
  source: 'bundled',
};
