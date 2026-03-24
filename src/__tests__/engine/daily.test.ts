import { describe, it, expect } from 'vitest';
import { generateDailyPuzzle, getTodayDateString } from '../../engine/daily';

describe('generateDailyPuzzle', () => {
  it('same date always generates the same puzzle', () => {
    const a = generateDailyPuzzle('2025-06-15');
    const b = generateDailyPuzzle('2025-06-15');
    expect(a.solution).toEqual(b.solution);
    expect(a.rowClues).toEqual(b.rowClues);
    expect(a.colClues).toEqual(b.colClues);
    expect(a.id).toBe(b.id);
  });

  it('different dates generate different puzzles', () => {
    const a = generateDailyPuzzle('2025-06-15');
    const b = generateDailyPuzzle('2025-06-16');
    expect(a.solution).not.toEqual(b.solution);
    expect(a.id).not.toBe(b.id);
  });

  it('puzzle has correct size and structure', () => {
    const puzzle = generateDailyPuzzle('2025-01-01');
    expect(puzzle.size).toBe(10);
    expect(puzzle.solution).toHaveLength(100);
    expect(puzzle.rowClues).toHaveLength(10);
    expect(puzzle.colClues).toHaveLength(10);
    // Solution should only contain 0s and 1s
    expect(puzzle.solution.every(v => v === 0 || v === 1)).toBe(true);
  });

  it('puzzle ID follows daily-YYYY-MM-DD format', () => {
    const puzzle = generateDailyPuzzle('2025-03-22');
    expect(puzzle.id).toBe('daily-2025-03-22');
  });

  it('puzzle has expected metadata', () => {
    const puzzle = generateDailyPuzzle('2025-06-15');
    expect(puzzle.difficulty).toBe('yellow');
    expect(puzzle.source).toBe('bundled');
    expect(puzzle.title).toContain('Daily Puzzle');
  });
});

describe('getTodayDateString', () => {
  it('returns a YYYY-MM-DD string', () => {
    const today = getTodayDateString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
