import { describe, it, expect } from 'vitest';
import { getEdgeCells, applyEdgeReveal, selectBombTargets, applyBomb } from '../../engine/powerups';
import { CellState } from '../../engine/types';

describe('getEdgeCells', () => {
  it('returns correct edge cells for a 5x5 grid', () => {
    const edges = getEdgeCells(5);
    expect(edges).toHaveLength(16);
    expect(edges).toContain(0);
    expect(edges).toContain(4);
    expect(edges).toContain(20);
    expect(edges).toContain(24);
    expect(edges).not.toContain(6);
    expect(edges).not.toContain(12);
  });

  it('returns correct count for 10x10', () => {
    const edges = getEdgeCells(10);
    expect(edges).toHaveLength(36);
  });

  it('returns correct count for 15x15', () => {
    const edges = getEdgeCells(15);
    expect(edges).toHaveLength(56);
  });

  it('returns sorted indices without duplicates', () => {
    const edges = getEdgeCells(5);
    const unique = [...new Set(edges)];
    expect(edges).toEqual(unique);
    expect(edges).toEqual([...edges].sort((a, b) => a - b));
  });
});

describe('applyEdgeReveal', () => {
  it('reveals all edge cells from solution', () => {
    const size = 5;
    const grid = new Array(25).fill(CellState.Empty);
    const solution = new Array(25).fill(1);
    solution[0] = 0;
    const result = applyEdgeReveal(grid, solution, size);
    expect(result[0]).toBe(CellState.Crossed);
    expect(result[1]).toBe(CellState.Filled);
    expect(result[6]).toBe(CellState.Empty);
  });

  it('does not mutate the original grid', () => {
    const size = 3;
    const solution = [1, 0, 1, 0, 0, 0, 1, 0, 1];
    const grid = new Array(9).fill(CellState.Empty);
    const original = [...grid];
    applyEdgeReveal(grid, solution, size);
    expect(grid).toEqual(original);
  });
});

describe('selectBombTargets', () => {
  it('returns valid cell indices within grid bounds', () => {
    const size = 10;
    const grid = new Array(size * size).fill(CellState.Empty);
    const targets = selectBombTargets(grid, size, 5);
    for (const idx of targets) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(size * size);
    }
  });

  it('does not exceed requested count', () => {
    const size = 10;
    const grid = new Array(size * size).fill(CellState.Empty);
    for (let i = 0; i < 20; i++) {
      const targets = selectBombTargets(grid, size, 5);
      expect(targets.length).toBeLessThanOrEqual(size * size);
    }
  });

  it('returns unique indices', () => {
    const grid = new Array(100).fill(CellState.Empty);
    const targets = selectBombTargets(grid, 10, 5);
    const unique = [...new Set(targets)];
    expect(targets.length).toBe(unique.length);
  });

  it('respects small count', () => {
    const grid = new Array(25).fill(CellState.Empty);
    const targets = selectBombTargets(grid, 5, 1);
    expect(targets.length).toBeGreaterThan(0);
    expect(targets.length).toBeLessThanOrEqual(25);
  });
});

describe('applyBomb', () => {
  it('reveals cells from solution and returns positions', () => {
    const size = 5;
    const grid = new Array(25).fill(CellState.Empty);
    const solution = new Array(25).fill(0);
    solution[0] = 1;
    solution[12] = 1;

    const result = applyBomb(grid, solution, size, { explosionCount: 3, minRadius: 1, maxRadius: 2 });
    expect(result.revealedPositions.length).toBeGreaterThan(0);
    for (const pos of result.revealedPositions) {
      expect(result.grid[pos]).not.toBe(CellState.Empty);
      if (solution[pos] === 1) {
        expect(result.grid[pos]).toBe(CellState.Filled);
      } else {
        expect(result.grid[pos]).toBe(CellState.Crossed);
      }
    }
  });

  it('does not mutate the original grid', () => {
    const size = 5;
    const grid = new Array(25).fill(CellState.Empty);
    const solution = new Array(25).fill(1);
    applyBomb(grid, solution, size, { explosionCount: 3, minRadius: 1, maxRadius: 2 });
    expect(grid.every(c => c === CellState.Empty)).toBe(true);
  });
});
