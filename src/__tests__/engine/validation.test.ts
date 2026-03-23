import { describe, it, expect } from 'vitest';
import { validateGrid, isCluesSatisfied, isLineSatisfied, getRowLine, getColLine } from '../../engine/validation';
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

describe('isCluesSatisfied', () => {
  const size = 5;

  // Helper to build a flat grid from a 2D array
  function makeGrid(rows: number[][]): CellState[] {
    return rows.flat() as CellState[];
  }

  it('returns true when row filled runs match the clue', () => {
    // Row 0: [F, F, E, F, E] → runs [2, 1]
    const grid = makeGrid([
      [1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    expect(isCluesSatisfied(grid, size, 0, 'row', [2, 1])).toBe(true);
  });

  it('returns false when row filled runs do not match the clue', () => {
    // Row 0: [F, F, E, F, E] → runs [2, 1], but clue is [3]
    const grid = makeGrid([
      [1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    expect(isCluesSatisfied(grid, size, 0, 'row', [3])).toBe(false);
  });

  it('returns true for empty row with [0] clue', () => {
    const grid = makeGrid([
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    expect(isCluesSatisfied(grid, size, 0, 'row', [0])).toBe(true);
  });

  it('returns false for partially filled row that does not match clue', () => {
    // Row 0: [F, E, E, E, E] → runs [1], but clue is [2, 1]
    const grid = makeGrid([
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    expect(isCluesSatisfied(grid, size, 0, 'row', [2, 1])).toBe(false);
  });

  it('returns true for column satisfaction', () => {
    // Col 0: rows 0,1,2 filled, rows 3,4 empty → runs [3]
    const grid = makeGrid([
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    expect(isCluesSatisfied(grid, size, 0, 'col', [3])).toBe(true);
  });

  it('returns false for column with wrong runs', () => {
    // Col 0: rows 0,1 filled, row 2 empty, row 3 filled → runs [2, 1], clue [3]
    const grid = makeGrid([
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    expect(isCluesSatisfied(grid, size, 0, 'col', [3])).toBe(false);
  });

  it('returns true for fully filled row matching correct clue', () => {
    // Row 0: all filled → runs [5]
    const grid = makeGrid([
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    expect(isCluesSatisfied(grid, size, 0, 'row', [5])).toBe(true);
  });

  it('correctly counts runs when crossed cells are between filled runs', () => {
    // Row 0: [F, F, X, F, E] → runs [2, 1] (crossed cells act as gaps)
    const grid = makeGrid([
      [1, 1, 2, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    expect(isCluesSatisfied(grid, size, 0, 'row', [2, 1])).toBe(true);
  });

  it('returns false for [0] clue when cells are filled', () => {
    const grid = makeGrid([
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    expect(isCluesSatisfied(grid, size, 0, 'row', [0])).toBe(false);
  });

  it('returns true for [0] clue when row has only crossed cells', () => {
    const grid = makeGrid([
      [2, 2, 2, 2, 2],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    expect(isCluesSatisfied(grid, size, 0, 'row', [0])).toBe(true);
  });
});

describe('isLineSatisfied', () => {
  it('returns true when filled runs match the clue', () => {
    const line = [1, 1, 0, 1, 0] as CellState[];
    expect(isLineSatisfied(line, [2, 1])).toBe(true);
  });

  it('returns false when filled runs do not match the clue', () => {
    const line = [1, 1, 0, 1, 0] as CellState[];
    expect(isLineSatisfied(line, [3])).toBe(false);
  });

  it('returns true for empty line with [0] clue', () => {
    const line = [0, 0, 0, 0, 0] as CellState[];
    expect(isLineSatisfied(line, [0])).toBe(true);
  });

  it('returns false for partial fill that does not match clue', () => {
    const line = [1, 0, 0, 0, 0] as CellState[];
    expect(isLineSatisfied(line, [2, 1])).toBe(false);
  });

  it('treats Crossed cells as gaps, same as Empty', () => {
    const line = [1, 1, 2, 1, 0] as CellState[];
    expect(isLineSatisfied(line, [2, 1])).toBe(true);
  });

  it('returns false for [0] clue when cells are filled', () => {
    const line = [1, 0, 0, 0, 0] as CellState[];
    expect(isLineSatisfied(line, [0])).toBe(false);
  });

  it('returns true for all-crossed line with [0] clue', () => {
    const line = [2, 2, 2, 2, 2] as CellState[];
    expect(isLineSatisfied(line, [0])).toBe(true);
  });
});

describe('getRowLine', () => {
  const size = 5;
  const grid = [
    1, 1, 0, 1, 0,
    0, 0, 0, 0, 0,
    1, 1, 1, 1, 1,
    1, 0, 1, 0, 1,
    0, 1, 1, 1, 0,
  ] as CellState[];

  it('extracts the correct row slice', () => {
    expect(getRowLine(grid, size, 0)).toEqual([1, 1, 0, 1, 0]);
    expect(getRowLine(grid, size, 2)).toEqual([1, 1, 1, 1, 1]);
    expect(getRowLine(grid, size, 4)).toEqual([0, 1, 1, 1, 0]);
  });
});

describe('getColLine', () => {
  const size = 5;
  const grid = [
    1, 1, 0, 1, 0,
    0, 0, 0, 0, 0,
    1, 1, 1, 1, 1,
    1, 0, 1, 0, 1,
    0, 1, 1, 1, 0,
  ] as CellState[];

  it('extracts the correct column slice', () => {
    expect(getColLine(grid, size, 0)).toEqual([1, 0, 1, 1, 0]);
    expect(getColLine(grid, size, 1)).toEqual([1, 0, 1, 0, 1]);
    expect(getColLine(grid, size, 4)).toEqual([0, 0, 1, 1, 0]);
  });
});
