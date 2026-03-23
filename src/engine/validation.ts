import type { CellState } from './types';

/** Extract the CellState slice for a given row from a flat grid. */
export function getRowLine(grid: CellState[], size: number, rowIndex: number): CellState[] {
  const start = rowIndex * size;
  return grid.slice(start, start + size);
}

/** Extract the CellState slice for a given column from a flat grid. */
export function getColLine(grid: CellState[], size: number, colIndex: number): CellState[] {
  const cells: CellState[] = [];
  for (let r = 0; r < size; r++) {
    cells.push(grid[r * size + colIndex]);
  }
  return cells;
}

/**
 * Check if a line's filled-cell pattern exactly matches the expected clues.
 * Only Filled (1) cells matter — Empty and Crossed are both treated as gaps.
 */
export function isLineSatisfied(line: CellState[], clues: number[]): boolean {
  const runs: number[] = [];
  let count = 0;
  for (const cell of line) {
    if (cell === 1) { // CellState.Filled
      count++;
    } else {
      if (count > 0) {
        runs.push(count);
        count = 0;
      }
    }
  }
  if (count > 0) runs.push(count);

  // Empty clue [0] is satisfied when no cells are filled
  if (clues.length === 1 && clues[0] === 0) {
    return runs.length === 0;
  }

  if (runs.length !== clues.length) return false;
  for (let i = 0; i < runs.length; i++) {
    if (runs[i] !== clues[i]) return false;
  }
  return true;
}

/**
 * Convenience wrapper around getRowLine/getColLine + isLineSatisfied.
 */
export function isCluesSatisfied(
  grid: CellState[],
  size: number,
  index: number,
  axis: 'row' | 'col',
  clues: number[],
): boolean {
  const line = axis === 'row'
    ? getRowLine(grid, size, index)
    : getColLine(grid, size, index);
  return isLineSatisfied(line, clues);
}

/**
 * Compute which rows and columns have their clues satisfied by the current grid state.
 */
export function getSatisfiedClues(
  grid: CellState[],
  size: number,
  rowClues: number[][],
  colClues: number[][],
): { satisfiedRows: Set<number>; satisfiedCols: Set<number> } {
  const satisfiedRows = new Set<number>();
  const satisfiedCols = new Set<number>();

  for (let i = 0; i < size; i++) {
    if (isLineSatisfied(getRowLine(grid, size, i), rowClues[i])) {
      satisfiedRows.add(i);
    }
    if (isLineSatisfied(getColLine(grid, size, i), colClues[i])) {
      satisfiedCols.add(i);
    }
  }

  return { satisfiedRows, satisfiedCols };
}

/**
 * Validate a user grid against the solution.
 *
 * Returns true when:
 * - Every cell that is filled (1) in the solution is Filled in the user grid
 * - No cell that is empty (0) in the solution is Filled in the user grid
 *
 * Crossed (X) marks and Empty cells are ignored — only Filled cells matter.
 */
export function validateGrid(userGrid: CellState[], solution: number[]): boolean {
  if (userGrid.length !== solution.length) return false;

  for (let i = 0; i < solution.length; i++) {
    const isFilled = userGrid[i] === 1; // CellState.Filled
    const shouldBeFilled = solution[i] === 1;

    if (shouldBeFilled && !isFilled) return false;
    if (!shouldBeFilled && isFilled) return false;
  }

  return true;
}
