import { describe, it, expect } from 'vitest';
import { getEdgeCells, applyEdgeReveal, generateBombTargets, applyBomb } from '../../engine/powerups';
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
    expect(getEdgeCells(10)).toHaveLength(36);
  });

  it('returns correct count for 15x15', () => {
    expect(getEdgeCells(15)).toHaveLength(56);
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

describe('generateBombTargets', () => {
  it('returns valid cell indices within grid bounds', () => {
    const size = 10;
    const targets = generateBombTargets(size);
    for (const idx of targets) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(size * size);
    }
  });

  it('does not reveal more than 25% of the grid', () => {
    const size = 10;
    const maxAllowed = Math.floor(size * size * 0.25);
    for (let i = 0; i < 20; i++) {
      const targets = generateBombTargets(size);
      expect(targets.length).toBeLessThanOrEqual(maxAllowed);
    }
  });

  it('returns unique sorted indices', () => {
    const targets = generateBombTargets(10);
    const unique = [...new Set(targets)];
    expect(targets).toEqual(unique);
    expect(targets).toEqual([...targets].sort((a, b) => a - b));
  });

  it('respects custom config', () => {
    const targets = generateBombTargets(5, { explosionCount: 1, minRadius: 1, maxRadius: 1 });
    expect(targets.length).toBeLessThanOrEqual(9);
    expect(targets.length).toBeGreaterThan(0);
  });
});

describe('applyBomb', () => {
  it('reveals cells from solution and returns positions', () => {
    const size = 5;
    const grid = new Array(25).fill(CellState.Empty);
    const solution = new Array(25).fill(0);
    solution[0] = 1;
    solution[12] = 1;

    const result = applyBomb(grid, solution, size);
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
    applyBomb(grid, solution, size);
    expect(grid.every(c => c === CellState.Empty)).toBe(true);
  });
});
