import type { PuzzleDefinition } from '../../../engine/types';
import { deriveRowClues, deriveColClues } from '../../../engine/clues';

// prettier-ignore
const solution = [
  0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, //               ■                nose cone
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, //             ■ ■ ■
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, //           ■ ■ ■ ■ ■
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, //           ■ ■ ■ ■ ■          body
  0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, //           ■ ■ . ■ ■          window
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, //           ■ ■ ■ ■ ■
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, //           ■ ■ ■ ■ ■
  0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, //           ■ ■ . ■ ■          window
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, //           ■ ■ ■ ■ ■
  0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, //         ■ ■ ■ ■ ■ ■ ■      fins start
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, //       ■ ■ ■ ■ ■ ■ ■ ■ ■
  0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, //     ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, //   ■ ■ . . ■ ■ ■ ■ ■ . . ■ ■  fins
  0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, //   ■ . . . . ■ ■ ■ . . . . ■  exhaust
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, //             ■ . ■              flames
];

const size = 15;

export const rocket: PuzzleDefinition = {
  id: 'rocket-15x15',
  title: 'Rocket',
  size,
  solution,
  rowClues: deriveRowClues(solution, size),
  colClues: deriveColClues(solution, size),
  difficulty: 'orange',
  description: 'A rocket ship blasting off',
  source: 'bundled',
};
