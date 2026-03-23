import { CellState } from './types';
import type { CellState as CellStateType, Difficulty } from './types';
import { HINT_COSTS } from './constants';

export function applyRowHint(grid: CellStateType[], solution: number[], size: number, row: number): CellStateType[] {
  const result = [...grid];
  const start = row * size;
  for (let col = 0; col < size; col++) {
    result[start + col] = solution[start + col] === 1 ? CellState.Filled : CellState.Crossed;
  }
  return result;
}

export function applyColHint(grid: CellStateType[], solution: number[], size: number, col: number): CellStateType[] {
  const result = [...grid];
  for (let row = 0; row < size; row++) {
    const idx = row * size + col;
    result[idx] = solution[idx] === 1 ? CellState.Filled : CellState.Crossed;
  }
  return result;
}

export function getHintCost(difficulty: Difficulty | undefined): number {
  if (difficulty === undefined) return 8;
  return HINT_COSTS[difficulty];
}
