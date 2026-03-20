import { describe, it, expect } from 'vitest';
import { createPuzzleFromGrid } from '../../engine/pixelizer';

// Note: pixelizeImage and createPuzzleFromImage require canvas/DOM
// which isn't available in jsdom. We test the grid-based creation
// and test threshold logic with unit-level data.

describe('createPuzzleFromGrid', () => {
  it('creates a valid puzzle from a 5x5 grid', () => {
    const solution = [
      1, 1, 0, 0, 0,
      1, 1, 0, 0, 0,
      0, 0, 0, 0, 0,
      0, 0, 0, 1, 1,
      0, 0, 0, 1, 1,
    ];
    const puzzle = createPuzzleFromGrid(solution, 5, 'Corners');
    expect(puzzle.title).toBe('Corners');
    expect(puzzle.size).toBe(5);
    expect(puzzle.solution).toEqual(solution);
    expect(puzzle.id).toMatch(/^user-/);
    expect(puzzle.source).toBe('user-created');
    expect(puzzle.rowClues).toEqual([[2], [2], [0], [2], [2]]);
    expect(puzzle.colClues).toEqual([[2], [2], [0], [2], [2]]);
  });

  it('creates a valid puzzle from a 10x10 grid', () => {
    const solution = new Array(100).fill(0);
    solution[0] = 1;
    solution[99] = 1;
    const puzzle = createPuzzleFromGrid(solution, 10, 'Diagonal');
    expect(puzzle.solution).toHaveLength(100);
    expect(puzzle.rowClues[0]).toEqual([1]);
    expect(puzzle.rowClues[9]).toEqual([1]);
    for (let i = 1; i < 9; i++) {
      expect(puzzle.rowClues[i]).toEqual([0]);
    }
  });

  it('creates a valid puzzle from a 15x15 grid', () => {
    const solution = new Array(225).fill(1);
    const puzzle = createPuzzleFromGrid(solution, 15, 'Full');
    expect(puzzle.rowClues.every(clue => clue[0] === 15)).toBe(true);
    expect(puzzle.colClues.every(clue => clue[0] === 15)).toBe(true);
  });

  it('handles all-empty grid', () => {
    const solution = new Array(25).fill(0);
    const puzzle = createPuzzleFromGrid(solution, 5, 'Empty');
    expect(puzzle.rowClues.every(clue => clue[0] === 0)).toBe(true);
    expect(puzzle.colClues.every(clue => clue[0] === 0)).toBe(true);
  });
});
