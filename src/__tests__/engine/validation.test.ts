import { describe, it, expect } from 'vitest';
import { validateGrid } from '../../engine/validation';
import { CellState } from '../../engine/types';

describe('validateGrid', () => {
  const solution = [
    1, 1, 0, 1, 0,
    0, 0, 0, 0, 0,
    1, 1, 1, 1, 1,
    1, 0, 1, 0, 1,
    0, 1, 1, 1, 0,
  ];

  it('returns true for a correctly filled grid', () => {
    const userGrid = solution.map(cell =>
      cell === 1 ? CellState.Filled : CellState.Empty
    );
    expect(validateGrid(userGrid, solution)).toBe(true);
  });

  it('returns true when correct fills have X marks on empty cells', () => {
    const userGrid = solution.map(cell =>
      cell === 1 ? CellState.Filled : CellState.Crossed
    );
    expect(validateGrid(userGrid, solution)).toBe(true);
  });

  it('returns true when correct fills have a mix of X and empty', () => {
    const userGrid = solution.map((cell, i) => {
      if (cell === 1) return CellState.Filled;
      return i % 2 === 0 ? CellState.Crossed : CellState.Empty;
    });
    expect(validateGrid(userGrid, solution)).toBe(true);
  });

  it('returns false when a required cell is not filled', () => {
    const userGrid = solution.map(cell =>
      cell === 1 ? CellState.Filled : CellState.Empty
    );
    // Remove one required fill
    userGrid[0] = CellState.Empty;
    expect(validateGrid(userGrid, solution)).toBe(false);
  });

  it('returns false when a non-solution cell is filled', () => {
    const userGrid = solution.map(cell =>
      cell === 1 ? CellState.Filled : CellState.Empty
    );
    // Fill a cell that should be empty
    userGrid[2] = CellState.Filled;
    expect(validateGrid(userGrid, solution)).toBe(false);
  });

  it('returns false for a completely empty user grid', () => {
    const userGrid = new Array(25).fill(CellState.Empty);
    expect(validateGrid(userGrid, solution)).toBe(false);
  });

  it('returns true for an all-empty solution with all-empty grid', () => {
    const emptySolution = new Array(25).fill(0);
    const userGrid = new Array(25).fill(CellState.Empty);
    expect(validateGrid(userGrid, emptySolution)).toBe(true);
  });

  it('returns true for an all-empty solution with all-crossed grid', () => {
    const emptySolution = new Array(25).fill(0);
    const userGrid = new Array(25).fill(CellState.Crossed);
    expect(validateGrid(userGrid, emptySolution)).toBe(true);
  });

  it('returns false for mismatched grid lengths', () => {
    const userGrid = [CellState.Filled, CellState.Empty];
    expect(validateGrid(userGrid, solution)).toBe(false);
  });

  it('returns false when a required cell is marked with X instead of filled', () => {
    const userGrid: CellState[] = solution.map(cell =>
      cell === 1 ? CellState.Filled : CellState.Empty
    );
    // Mark a required cell with X
    userGrid[0] = CellState.Crossed;
    expect(validateGrid(userGrid, solution)).toBe(false);
  });
});
