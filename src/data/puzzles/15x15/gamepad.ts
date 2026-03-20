import type { PuzzleDefinition } from '../../../engine/types';
import { deriveRowClues, deriveColClues } from '../../../engine/clues';

// prettier-ignore
const solution = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 
  0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, //     ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■      top edge
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, //   ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, //   ■ ■ . ■ . ■ ■ ■ . ■ . ■ ■    d-pad + buttons
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, // ■ ■ . ■ ■ ■ . ■ . ■ ■ ■ . ■ ■  d-pad cross + btns
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, //   ■ ■ . ■ . ■ ■ ■ . ■ . ■ ■    d-pad + buttons
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, //   ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, //     ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■
  0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, //       ■ ■ . . . . . ■ ■        grips
  0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, //       ■ ■ . . . . . ■ ■
  0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, //       ■ ■ . . . . . ■ ■
  0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, //         ■ ■ . . . ■ ■          grip ends
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, //
];

const size = 15;

export const gamepad: PuzzleDefinition = {
  id: 'gamepad-15x15',
  title: 'Gamepad',
  size,
  solution,
  rowClues: deriveRowClues(solution, size),
  colClues: deriveColClues(solution, size),
  difficulty: 'hard',
  description: 'A retro game controller',
  source: 'bundled',
};
