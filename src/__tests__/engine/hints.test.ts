import { describe, it, expect } from 'vitest';
import {
  applyRowHint,
  applyColHint,
  getHintCost,
  getRevealableCount,
  isRowFullyRevealed,
  isColFullyRevealed,
} from '../../engine/hints';
import { CellState } from '../../engine/types';

// 5×5 solution used across most tests
// prettier-ignore
const solution = [
  1, 0, 1, 0, 1,  // row 0
  0, 1, 0, 1, 0,  // row 1
  1, 1, 1, 0, 0,  // row 2
  0, 0, 1, 1, 0,  // row 3
  1, 0, 0, 0, 1,  // row 4
];
const size = 5;

function emptyGrid(): (typeof CellState)[keyof typeof CellState][] {
  return new Array(size * size).fill(CellState.Empty);
}

// ─── applyRowHint ────────────────────────────────────────────

describe('applyRowHint', () => {
  it('fills and crosses cells according to the solution for row 0', () => {
    const grid = emptyGrid();
    const result = applyRowHint(grid, solution, size, 0);
    // row 0 solution: 1, 0, 1, 0, 1
    expect(result[0]).toBe(CellState.Filled);
    expect(result[1]).toBe(CellState.Crossed);
    expect(result[2]).toBe(CellState.Filled);
    expect(result[3]).toBe(CellState.Crossed);
    expect(result[4]).toBe(CellState.Filled);
  });

  it('leaves other rows unchanged', () => {
    const grid = emptyGrid();
    const result = applyRowHint(grid, solution, size, 0);
    // rows 1–4 should still be Empty
    for (let i = size; i < size * size; i++) {
      expect(result[i]).toBe(CellState.Empty);
    }
  });

  it('does not mutate the original grid', () => {
    const grid = emptyGrid();
    applyRowHint(grid, solution, size, 0);
    expect(grid[0]).toBe(CellState.Empty);
  });

  it('returns same values on an already-correct row', () => {
    // Pre-fill row 2 correctly: solution [1,1,1,0,0]
    const grid = emptyGrid();
    grid[10] = CellState.Filled;
    grid[11] = CellState.Filled;
    grid[12] = CellState.Filled;
    grid[13] = CellState.Crossed;
    grid[14] = CellState.Crossed;

    const result = applyRowHint(grid, solution, size, 2);
    for (let i = 10; i < 15; i++) {
      expect(result[i]).toBe(grid[i]);
    }
  });

  it('overwrites incorrect values', () => {
    // Mark cells as Crossed where they should be Filled
    const grid = emptyGrid();
    grid[0] = CellState.Crossed; // should be Filled
    grid[2] = CellState.Crossed; // should be Filled

    const result = applyRowHint(grid, solution, size, 0);
    expect(result[0]).toBe(CellState.Filled);
    expect(result[2]).toBe(CellState.Filled);
  });

  it('handles first row (row 0)', () => {
    const result = applyRowHint(emptyGrid(), solution, size, 0);
    expect(result.slice(0, 5)).toEqual([
      CellState.Filled, CellState.Crossed, CellState.Filled, CellState.Crossed, CellState.Filled,
    ]);
  });

  it('handles last row (row size-1)', () => {
    const result = applyRowHint(emptyGrid(), solution, size, size - 1);
    // row 4 solution: 1, 0, 0, 0, 1
    expect(result[20]).toBe(CellState.Filled);
    expect(result[21]).toBe(CellState.Crossed);
    expect(result[22]).toBe(CellState.Crossed);
    expect(result[23]).toBe(CellState.Crossed);
    expect(result[24]).toBe(CellState.Filled);
  });
});

// ─── applyColHint ────────────────────────────────────────────

describe('applyColHint', () => {
  it('fills and crosses cells according to the solution for col 0', () => {
    const grid = emptyGrid();
    // col 0 solution: indices 0,5,10,15,20 → [1,0,1,0,1]
    const result = applyColHint(grid, solution, size, 0);
    expect(result[0]).toBe(CellState.Filled);
    expect(result[5]).toBe(CellState.Crossed);
    expect(result[10]).toBe(CellState.Filled);
    expect(result[15]).toBe(CellState.Crossed);
    expect(result[20]).toBe(CellState.Filled);
  });

  it('leaves other columns unchanged', () => {
    const grid = emptyGrid();
    const result = applyColHint(grid, solution, size, 0);
    for (let row = 0; row < size; row++) {
      for (let col = 1; col < size; col++) {
        expect(result[row * size + col]).toBe(CellState.Empty);
      }
    }
  });

  it('does not mutate the original grid', () => {
    const grid = emptyGrid();
    applyColHint(grid, solution, size, 0);
    expect(grid[0]).toBe(CellState.Empty);
  });

  it('overwrites incorrect values in the column', () => {
    const grid = emptyGrid();
    grid[0] = CellState.Crossed;  // should be Filled
    grid[10] = CellState.Crossed; // should be Filled

    const result = applyColHint(grid, solution, size, 0);
    expect(result[0]).toBe(CellState.Filled);
    expect(result[10]).toBe(CellState.Filled);
  });

  it('handles first column (col 0)', () => {
    const result = applyColHint(emptyGrid(), solution, size, 0);
    const colValues = [0, 5, 10, 15, 20].map(i => result[i]);
    expect(colValues).toEqual([
      CellState.Filled, CellState.Crossed, CellState.Filled, CellState.Crossed, CellState.Filled,
    ]);
  });

  it('handles last column (col size-1)', () => {
    // col 4 solution: indices 4,9,14,19,24 → [1,0,0,0,1]
    const result = applyColHint(emptyGrid(), solution, size, size - 1);
    expect(result[4]).toBe(CellState.Filled);
    expect(result[9]).toBe(CellState.Crossed);
    expect(result[14]).toBe(CellState.Crossed);
    expect(result[19]).toBe(CellState.Crossed);
    expect(result[24]).toBe(CellState.Filled);
  });
});

// ─── getRevealableCount ──────────────────────────────────────

describe('getRevealableCount', () => {
  it('returns size for an empty grid (full row)', () => {
    expect(getRevealableCount(emptyGrid(), solution, size, 0, 'row')).toBe(size);
  });

  it('returns size for an empty grid (full column)', () => {
    expect(getRevealableCount(emptyGrid(), solution, size, 0, 'col')).toBe(size);
  });

  it('returns correct count for a partially filled row', () => {
    const grid = emptyGrid();
    // Correctly set index 0 (Filled) and index 1 (Crossed)
    grid[0] = CellState.Filled;
    grid[1] = CellState.Crossed;
    // Remaining 3 cells in row 0 still need revealing
    expect(getRevealableCount(grid, solution, size, 0, 'row')).toBe(3);
  });

  it('returns 0 for a fully correct row', () => {
    const grid = emptyGrid();
    // Row 0: 1,0,1,0,1
    grid[0] = CellState.Filled;
    grid[1] = CellState.Crossed;
    grid[2] = CellState.Filled;
    grid[3] = CellState.Crossed;
    grid[4] = CellState.Filled;
    expect(getRevealableCount(grid, solution, size, 0, 'row')).toBe(0);
  });

  it('counts incorrectly set cells as revealable', () => {
    const grid = emptyGrid();
    // Set all row 0 to Crossed — indices 1,3 correct; 0,2,4 wrong → 3 revealable
    for (let i = 0; i < size; i++) grid[i] = CellState.Crossed;
    expect(getRevealableCount(grid, solution, size, 0, 'row')).toBe(3);
  });

  it('returns correct count for a partially filled column', () => {
    const grid = emptyGrid();
    // col 0 solution: [1,0,1,0,1]; correctly set first two
    grid[0] = CellState.Filled;
    grid[5] = CellState.Crossed;
    expect(getRevealableCount(grid, solution, size, 0, 'col')).toBe(3);
  });

  it('returns 0 for a fully correct column', () => {
    const grid = emptyGrid();
    // col 0: [1,0,1,0,1]
    grid[0] = CellState.Filled;
    grid[5] = CellState.Crossed;
    grid[10] = CellState.Filled;
    grid[15] = CellState.Crossed;
    grid[20] = CellState.Filled;
    expect(getRevealableCount(grid, solution, size, 0, 'col')).toBe(0);
  });
});

// ─── isRowFullyRevealed ──────────────────────────────────────

describe('isRowFullyRevealed', () => {
  it('returns false for an empty grid', () => {
    expect(isRowFullyRevealed(emptyGrid(), solution, size, 0)).toBe(false);
  });

  it('returns true when all cells match the solution', () => {
    const grid = emptyGrid();
    // Row 0: 1,0,1,0,1
    grid[0] = CellState.Filled;
    grid[1] = CellState.Crossed;
    grid[2] = CellState.Filled;
    grid[3] = CellState.Crossed;
    grid[4] = CellState.Filled;
    expect(isRowFullyRevealed(grid, solution, size, 0)).toBe(true);
  });

  it('returns false when any cell is wrong', () => {
    const grid = emptyGrid();
    grid[0] = CellState.Filled;
    grid[1] = CellState.Crossed;
    grid[2] = CellState.Filled;
    grid[3] = CellState.Crossed;
    // index 4 should be Filled but is Empty
    expect(isRowFullyRevealed(grid, solution, size, 0)).toBe(false);
  });

  it('handles first row (row 0)', () => {
    const grid = applyRowHint(emptyGrid(), solution, size, 0);
    expect(isRowFullyRevealed(grid, solution, size, 0)).toBe(true);
  });

  it('handles last row (row size-1)', () => {
    const grid = applyRowHint(emptyGrid(), solution, size, size - 1);
    expect(isRowFullyRevealed(grid, solution, size, size - 1)).toBe(true);
  });
});

// ─── isColFullyRevealed ──────────────────────────────────────

describe('isColFullyRevealed', () => {
  it('returns false for an empty grid', () => {
    expect(isColFullyRevealed(emptyGrid(), solution, size, 0)).toBe(false);
  });

  it('returns true when all cells match the solution', () => {
    const grid = emptyGrid();
    // col 0: [1,0,1,0,1]
    grid[0] = CellState.Filled;
    grid[5] = CellState.Crossed;
    grid[10] = CellState.Filled;
    grid[15] = CellState.Crossed;
    grid[20] = CellState.Filled;
    expect(isColFullyRevealed(grid, solution, size, 0)).toBe(true);
  });

  it('returns false when any cell is wrong', () => {
    const grid = emptyGrid();
    grid[0] = CellState.Filled;
    grid[5] = CellState.Crossed;
    grid[10] = CellState.Filled;
    grid[15] = CellState.Crossed;
    // index 20 should be Filled but is Empty
    expect(isColFullyRevealed(grid, solution, size, 0)).toBe(false);
  });

  it('handles first column (col 0)', () => {
    const grid = applyColHint(emptyGrid(), solution, size, 0);
    expect(isColFullyRevealed(grid, solution, size, 0)).toBe(true);
  });

  it('handles last column (col size-1)', () => {
    const grid = applyColHint(emptyGrid(), solution, size, size - 1);
    expect(isColFullyRevealed(grid, solution, size, size - 1)).toBe(true);
  });
});

// ─── getHintCost (existing) ──────────────────────────────────

describe('getHintCost', () => {
  it('returns correct costs for each difficulty', () => {
    expect(getHintCost('blue')).toBe(3);
    expect(getHintCost('green')).toBe(5);
    expect(getHintCost('yellow')).toBe(8);
    expect(getHintCost('orange')).toBe(12);
    expect(getHintCost('red')).toBe(15);
  });

  it('returns default cost when difficulty is undefined', () => {
    expect(getHintCost(undefined)).toBe(8);
  });
});
