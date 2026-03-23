import { describe, it, expect } from 'vitest';
import { exportPuzzle, importPuzzle } from '../../engine/serialization';
import type { PuzzleDefinition } from '../../engine/types';

const samplePuzzle: PuzzleDefinition = {
  id: 'test-1',
  title: 'Test Heart',
  size: 5,
  solution: [
    0, 1, 0, 1, 0,
    1, 1, 1, 1, 1,
    1, 1, 1, 1, 1,
    0, 1, 1, 1, 0,
    0, 0, 1, 0, 0,
  ],
  rowClues: [[1, 1], [5], [5], [3], [1]],
  colClues: [[2], [4], [4], [4], [2]],
  difficulty: 'blue',
  description: 'A simple heart',
  source: 'bundled',
};

describe('exportPuzzle', () => {
  it('produces valid JSON with version field', () => {
    const json = exportPuzzle(samplePuzzle);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.puzzle.title).toBe('Test Heart');
    expect(parsed.puzzle.size).toBe(5);
    expect(parsed.puzzle.solution).toHaveLength(25);
  });

  it('does not include id or source in export', () => {
    const json = exportPuzzle(samplePuzzle);
    const parsed = JSON.parse(json);
    expect(parsed.puzzle.id).toBeUndefined();
    expect(parsed.puzzle.source).toBeUndefined();
  });
});

describe('importPuzzle', () => {
  it('round-trips correctly', () => {
    const json = exportPuzzle(samplePuzzle);
    const imported = importPuzzle(json);
    expect(imported.title).toBe(samplePuzzle.title);
    expect(imported.size).toBe(samplePuzzle.size);
    expect(imported.solution).toEqual(samplePuzzle.solution);
    expect(imported.rowClues).toEqual(samplePuzzle.rowClues);
    expect(imported.colClues).toEqual(samplePuzzle.colClues);
    expect(imported.source).toBe('imported');
    expect(imported.id).toMatch(/^imported-/);
  });

  it('throws on invalid JSON', () => {
    expect(() => importPuzzle('not json')).toThrow('Invalid JSON');
  });

  it('throws on missing puzzle data', () => {
    expect(() => importPuzzle('{"version": 1}')).toThrow('Missing puzzle data');
  });

  it('throws on invalid size', () => {
    const json = JSON.stringify({
      version: 1,
      puzzle: { size: 7, solution: new Array(49).fill(0) },
    });
    expect(() => importPuzzle(json)).toThrow('Invalid size');
  });

  it('throws on wrong solution length', () => {
    const json = JSON.stringify({
      version: 1,
      puzzle: { size: 5, solution: [0, 1, 0] },
    });
    expect(() => importPuzzle(json)).toThrow('Solution must be an array of 25 elements');
  });

  it('throws on invalid solution values', () => {
    const json = JSON.stringify({
      version: 1,
      puzzle: { size: 5, solution: new Array(25).fill(2) },
    });
    expect(() => importPuzzle(json)).toThrow('Solution cells must be 0 or 1');
  });

  it('throws on unsupported version', () => {
    const json = JSON.stringify({ version: 99, puzzle: {} });
    expect(() => importPuzzle(json)).toThrow('Unsupported puzzle version');
  });

  it('defaults title when missing', () => {
    const json = JSON.stringify({
      version: 1,
      puzzle: { size: 5, solution: new Array(25).fill(0) },
    });
    const imported = importPuzzle(json);
    expect(imported.title).toBe('Imported Puzzle');
  });

  it('re-derives clues from solution', () => {
    // Provide wrong clues — import should fix them
    const json = JSON.stringify({
      version: 1,
      puzzle: {
        title: 'Bad Clues',
        size: 5,
        solution: [
          1, 1, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
        ],
        rowClues: [[99]],
        colClues: [[99]],
      },
    });
    const imported = importPuzzle(json);
    expect(imported.rowClues[0]).toEqual([2]);
    expect(imported.rowClues[1]).toEqual([0]);
  });
});
