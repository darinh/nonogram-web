import { describe, it, expect } from 'vitest';
import { deriveRowClues, deriveColClues } from '../../engine/clues';

describe('deriveRowClues', () => {
  it('derives clues for a 5x5 grid', () => {
    // Row 0: ■ ■ □ ■ □ → [2, 1]
    // Row 1: □ □ □ □ □ → [0]
    // Row 2: ■ ■ ■ ■ ■ → [5]
    // Row 3: ■ □ ■ □ ■ → [1, 1, 1]
    // Row 4: □ ■ ■ ■ □ → [3]
    const solution = [
      1, 1, 0, 1, 0,
      0, 0, 0, 0, 0,
      1, 1, 1, 1, 1,
      1, 0, 1, 0, 1,
      0, 1, 1, 1, 0,
    ];
    const clues = deriveRowClues(solution, 5);
    expect(clues).toEqual([
      [2, 1],
      [0],
      [5],
      [1, 1, 1],
      [3],
    ]);
  });

  it('handles an empty row', () => {
    const solution = new Array(25).fill(0);
    const clues = deriveRowClues(solution, 5);
    expect(clues).toEqual([[0], [0], [0], [0], [0]]);
  });

  it('handles a fully filled row', () => {
    const solution = [
      1, 1, 1, 1, 1,
      ...new Array(20).fill(0),
    ];
    const clues = deriveRowClues(solution, 5);
    expect(clues[0]).toEqual([5]);
  });

  it('handles a single filled cell', () => {
    const solution = [
      0, 0, 1, 0, 0,
      ...new Array(20).fill(0),
    ];
    const clues = deriveRowClues(solution, 5);
    expect(clues[0]).toEqual([1]);
  });

  it('handles alternating pattern', () => {
    const solution = [
      1, 0, 1, 0, 1,
      ...new Array(20).fill(0),
    ];
    const clues = deriveRowClues(solution, 5);
    expect(clues[0]).toEqual([1, 1, 1]);
  });

  it('works with 10x10 grid', () => {
    const solution = new Array(100).fill(0);
    // Row 0: fill cells 0,1,2 and 5,6
    solution[0] = 1; solution[1] = 1; solution[2] = 1;
    solution[5] = 1; solution[6] = 1;
    const clues = deriveRowClues(solution, 10);
    expect(clues[0]).toEqual([3, 2]);
    // Remaining rows should all be [0]
    for (let i = 1; i < 10; i++) {
      expect(clues[i]).toEqual([0]);
    }
  });

  it('handles row ending with filled cells', () => {
    const solution = [
      0, 0, 0, 1, 1,
      ...new Array(20).fill(0),
    ];
    const clues = deriveRowClues(solution, 5);
    expect(clues[0]).toEqual([2]);
  });
});

describe('deriveColClues', () => {
  it('derives clues for a 5x5 grid', () => {
    // Col 0: 1,0,1,1,0 → [1, 2]
    // Col 1: 1,0,1,0,1 → [1, 1, 1]
    // Col 2: 0,0,1,1,1 → [3]
    // Col 3: 1,0,1,0,1 → [1, 1, 1]
    // Col 4: 0,0,1,1,0 → [2]
    const solution = [
      1, 1, 0, 1, 0,
      0, 0, 0, 0, 0,
      1, 1, 1, 1, 1,
      1, 0, 1, 0, 1,
      0, 1, 1, 1, 0,
    ];
    const clues = deriveColClues(solution, 5);
    expect(clues).toEqual([
      [1, 2],
      [1, 1, 1],
      [3],
      [1, 1, 1],
      [2],
    ]);
  });

  it('handles an empty column', () => {
    const solution = [
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
    ];
    const clues = deriveColClues(solution, 5);
    expect(clues).toEqual([[0], [0], [0], [0], [0]]);
  });

  it('handles a fully filled column', () => {
    const solution = [
      1, 0, 0, 0, 0,
      1, 0, 0, 0, 0,
      1, 0, 0, 0, 0,
      1, 0, 0, 0, 0,
      1, 0, 0, 0, 0,
    ];
    const clues = deriveColClues(solution, 5);
    expect(clues[0]).toEqual([5]);
  });

  it('handles column ending with filled cells', () => {
    const solution = [
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
      1, 0, 0, 0, 0,
      1, 0, 0, 0, 0,
    ];
    const clues = deriveColClues(solution, 5);
    expect(clues[0]).toEqual([2]);
  });

  it('works with 15x15 grid', () => {
    const solution = new Array(225).fill(0);
    // Col 0: fill rows 0,1,2 and 5,6
    solution[0 * 15] = 1;
    solution[1 * 15] = 1;
    solution[2 * 15] = 1;
    solution[5 * 15] = 1;
    solution[6 * 15] = 1;
    const clues = deriveColClues(solution, 15);
    expect(clues[0]).toEqual([3, 2]);
  });
});
