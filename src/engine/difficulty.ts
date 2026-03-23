import type { Difficulty, GridSize } from './types';
import { DIFFICULTY_COLORS } from './constants';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  blue: 'Easiest',
  green: 'Easy',
  yellow: 'Normal',
  orange: 'Difficult',
  red: 'Very Hard',
};

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  blue: 0,
  green: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

const DIFFICULTY_GRID_SIZES: Record<Difficulty, GridSize> = {
  blue: 5,
  green: 5,
  yellow: 10,
  orange: 10,
  red: 15,
};

export function getDifficultyColor(difficulty: Difficulty): string {
  return DIFFICULTY_COLORS[difficulty];
}

export function getDifficultyLabel(difficulty: Difficulty): string {
  return DIFFICULTY_LABELS[difficulty];
}

export function getDifficultyOrder(difficulty: Difficulty): number {
  return DIFFICULTY_ORDER[difficulty];
}

export function suggestGridSize(difficulty: Difficulty): GridSize {
  return DIFFICULTY_GRID_SIZES[difficulty];
}
