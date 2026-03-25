import type { PuzzleDefinition } from '../../engine/types';
import { spacePuzzles } from './space-puzzles';
import { oceanPuzzles } from './ocean-puzzles';
import { cityPuzzles } from './city-puzzles';
import { fantasyPuzzles } from './fantasy-puzzles';
import { foodPuzzles } from './food-puzzles';
import { naturePuzzles } from './nature-puzzles';

export const themePuzzles: PuzzleDefinition[] = [
  ...spacePuzzles,
  ...oceanPuzzles,
  ...cityPuzzles,
  ...fantasyPuzzles,
  ...foodPuzzles,
  ...naturePuzzles,
];
