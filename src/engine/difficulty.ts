import { Difficulty } from './types';
import type { GridSize } from './types';

const COLORS: Record<Difficulty, string> = {
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#EAB308',
  orange: '#F97316',
  red: '#EF4444',
};

const LABELS: Record<Difficulty, string> = {
  blue: 'Easiest',
  green: 'Easy',
  yellow: 'Normal',
  orange: 'Difficult',
  red: 'Expert',
};

const ORDER: Record<Difficulty, number> = {
  blue: 0,
  green: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

const GRID_SIZES: Record<Difficulty, GridSize> = {
  blue: 5,
  green: 5,
  yellow: 10,
  orange: 10,
  red: 15,
};

const LEGACY_MAP: Record<string, Difficulty> = {
  easy: Difficulty.Blue,
  medium: Difficulty.Yellow,
  hard: Difficulty.Red,
};

export function getDifficultyColor(d: Difficulty): string {
  return COLORS[d];
}

export function getDifficultyLabel(d: Difficulty): string {
  return LABELS[d];
}

export function getDifficultyOrder(d: Difficulty): number {
  return ORDER[d];
}

export function suggestGridSize(difficulty: Difficulty): GridSize {
  return GRID_SIZES[difficulty];
}

export function suggestDifficulty(size: GridSize, filledRatio: number): Difficulty {
  switch (size) {
    case 5:
      return filledRatio < 0.4 ? Difficulty.Blue : Difficulty.Green;
    case 10:
      if (filledRatio < 0.3) return Difficulty.Green;
      if (filledRatio < 0.5) return Difficulty.Yellow;
      return Difficulty.Orange;
    case 15:
      return filledRatio < 0.4 ? Difficulty.Orange : Difficulty.Red;
  }
}

export function migrateLegacyDifficulty(old: string): Difficulty {
  return LEGACY_MAP[old.toLowerCase()] ?? Difficulty.Yellow;
}
