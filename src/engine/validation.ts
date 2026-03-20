import type { CellState } from './types';

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
