import { describe, it, expect } from 'vitest';
import { applyRowHint, applyColHint, getHintCost } from '../../engine/hints';
import { CellState } from '../../engine/types';

const size = 5;
const solution = [
  1, 1, 0, 1, 0,
  0, 0, 0, 0, 0,
  1, 1, 1, 1, 1,
  1, 0, 1, 0, 1,
  0, 1, 1, 1, 0,
];

function emptyGrid(): typeof CellState.Empty[] {
  return new Array(size * size).fill(CellState.Empty);
}

describe('applyRowHint', () => {
  it('fills a row according to the solution', () => {
    const grid = emptyGrid();
    const result = applyRowHint(grid, solution, size, 0);
    expect(result.slice(0, 5)).toEqual([
      CellState.Filled, CellState.Filled, CellState.Crossed, CellState.Filled, CellState.Crossed,
    ]);
  });

  it('does not affect other rows', () => {
    const grid = emptyGrid();
    const result = applyRowHint(grid, solution, size, 2);
    expect(result.slice(0, 5)).toEqual([0, 0, 0, 0, 0]);
    expect(result.slice(15, 20)).toEqual([0, 0, 0, 0, 0]);
  });

  it('does not mutate the original grid', () => {
    const grid = emptyGrid();
    applyRowHint(grid, solution, size, 0);
    expect(grid[0]).toBe(CellState.Empty);
  });
});

describe('applyColHint', () => {
  it('fills a column according to the solution', () => {
    const grid = emptyGrid();
    const result = applyColHint(grid, solution, size, 0);
    const colValues = [0, 5, 10, 15, 20].map(i => result[i]);
    expect(colValues).toEqual([
      CellState.Filled, CellState.Crossed, CellState.Filled, CellState.Filled, CellState.Crossed,
    ]);
  });

  it('does not affect other columns', () => {
    const grid = emptyGrid();
    const result = applyColHint(grid, solution, size, 0);
    expect(result[1]).toBe(CellState.Empty);
    expect(result[6]).toBe(CellState.Empty);
  });
});

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
