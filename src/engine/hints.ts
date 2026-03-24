import { CellState } from './types';
import type { CellState as CellStateType } from './types';
import type { Difficulty } from './types';
import { HINT_COSTS } from './constants';

/**
 * Apply a row hint: reveal the entire row by setting each cell
 * to Filled or Crossed according to the solution.
 * Returns a new grid (does not mutate the original).
 */
export function applyRowHint(
  grid: CellStateType[],
  solution: number[],
  size: number,
  row: number,
): CellStateType[] {
  const result = grid.slice();
  const start = row * size;
  for (let col = 0; col < size; col++) {
    const i = start + col;
    result[i] = solution[i] === 1 ? CellState.Filled : CellState.Crossed;
  }
  return result;
}

/**
 * Apply a column hint: reveal the entire column by setting each cell
 * to Filled or Crossed according to the solution.
 * Returns a new grid (does not mutate the original).
 */
export function applyColHint(
  grid: CellStateType[],
  solution: number[],
  size: number,
  col: number,
): CellStateType[] {
  const result = grid.slice();
  for (let row = 0; row < size; row++) {
    const i = row * size + col;
    result[i] = solution[i] === 1 ? CellState.Filled : CellState.Crossed;
  }
  return result;
}

/**
 * Count how many cells in the given row or column would change
 * if a hint were applied. A cell is "already correct" when:
 *   solution === 1 and grid === Filled, OR
 *   solution === 0 and grid === Crossed.
 */
export function getRevealableCount(
  grid: CellStateType[],
  solution: number[],
  size: number,
  index: number,
  axis: 'row' | 'col',
): number {
  let count = 0;
  for (let step = 0; step < size; step++) {
    const i = axis === 'row' ? index * size + step : step * size + index;
    const expected: CellStateType =
      solution[i] === 1 ? CellState.Filled : CellState.Crossed;
    if (grid[i] !== expected) {
      count++;
    }
  }
  return count;
}

/**
 * True when every cell in the row already matches the solution
 * (Filled where solution === 1, Crossed where solution === 0).
 */
export function isRowFullyRevealed(
  grid: CellStateType[],
  solution: number[],
  size: number,
  row: number,
): boolean {
  const start = row * size;
  for (let col = 0; col < size; col++) {
    const i = start + col;
    const expected: CellStateType =
      solution[i] === 1 ? CellState.Filled : CellState.Crossed;
    if (grid[i] !== expected) {
      return false;
    }
  }
  return true;
}

/**
 * True when every cell in the column already matches the solution.
 */
export function isColFullyRevealed(
  grid: CellStateType[],
  solution: number[],
  size: number,
  col: number,
): boolean {
  for (let row = 0; row < size; row++) {
    const i = row * size + col;
    const expected: CellStateType =
      solution[i] === 1 ? CellState.Filled : CellState.Crossed;
    if (grid[i] !== expected) {
      return false;
    }
  }
  return true;
}

export function getHintCost(difficulty: Difficulty | undefined): number {
  if (difficulty === undefined) return 8;
  return HINT_COSTS[difficulty];
}
