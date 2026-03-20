import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStoragePuzzleProvider } from '../../providers/puzzle/LocalStoragePuzzleProvider';
import { StaticPuzzleProvider } from '../../providers/puzzle/StaticPuzzleProvider';
import { CompositePuzzleProvider } from '../../providers/puzzle/CompositePuzzleProvider';
import type { PuzzleDefinition } from '../../engine/types';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  });
});

const testPuzzle: PuzzleDefinition = {
  id: 'custom-1',
  title: 'Custom Puzzle',
  size: 5,
  solution: new Array(25).fill(0),
  rowClues: Array.from({ length: 5 }, () => [0]),
  colClues: Array.from({ length: 5 }, () => [0]),
  source: 'user-created',
};

describe('StaticPuzzleProvider', () => {
  const provider = new StaticPuzzleProvider();

  it('returns bundled puzzles', async () => {
    const puzzles = await provider.getAllPuzzles();
    expect(puzzles.length).toBeGreaterThan(0);
    expect(puzzles.every(p => p.source === 'bundled')).toBe(true);
  });

  it('finds a puzzle by ID', async () => {
    const puzzles = await provider.getAllPuzzles();
    const first = puzzles[0];
    const found = await provider.getPuzzleById(first.id);
    expect(found).toEqual(first);
  });

  it('returns null for unknown ID', async () => {
    const found = await provider.getPuzzleById('nonexistent');
    expect(found).toBeNull();
  });
});

describe('LocalStoragePuzzleProvider', () => {
  const provider = new LocalStoragePuzzleProvider();

  it('starts empty', async () => {
    const puzzles = await provider.getAllPuzzles();
    expect(puzzles).toEqual([]);
  });

  it('saves and retrieves a puzzle', async () => {
    await provider.savePuzzle(testPuzzle);
    const puzzles = await provider.getAllPuzzles();
    expect(puzzles).toHaveLength(1);
    expect(puzzles[0].id).toBe('custom-1');
  });

  it('updates an existing puzzle', async () => {
    await provider.savePuzzle(testPuzzle);
    await provider.savePuzzle({ ...testPuzzle, title: 'Updated' });
    const puzzles = await provider.getAllPuzzles();
    expect(puzzles).toHaveLength(1);
    expect(puzzles[0].title).toBe('Updated');
  });

  it('deletes a puzzle', async () => {
    await provider.savePuzzle(testPuzzle);
    await provider.deletePuzzle('custom-1');
    const puzzles = await provider.getAllPuzzles();
    expect(puzzles).toEqual([]);
  });

  it('finds by ID', async () => {
    await provider.savePuzzle(testPuzzle);
    const found = await provider.getPuzzleById('custom-1');
    expect(found?.title).toBe('Custom Puzzle');
  });
});

describe('CompositePuzzleProvider', () => {
  it('merges puzzles from multiple providers', async () => {
    const localProvider = new LocalStoragePuzzleProvider();
    await localProvider.savePuzzle(testPuzzle);
    const composite = new CompositePuzzleProvider([new StaticPuzzleProvider(), localProvider]);

    const puzzles = await composite.getAllPuzzles();
    const ids = puzzles.map(p => p.id);
    expect(ids).toContain('custom-1');
    // Should also include bundled puzzles
    expect(puzzles.length).toBeGreaterThan(1);
  });

  it('delegates save to writable provider', async () => {
    const localProvider = new LocalStoragePuzzleProvider();
    const composite = new CompositePuzzleProvider([new StaticPuzzleProvider(), localProvider]);

    await composite.savePuzzle(testPuzzle);
    const found = await localProvider.getPuzzleById('custom-1');
    expect(found).not.toBeNull();
  });

  it('finds puzzles from any provider', async () => {
    const composite = new CompositePuzzleProvider([new StaticPuzzleProvider(), new LocalStoragePuzzleProvider()]);
    const allPuzzles = await composite.getAllPuzzles();
    const first = allPuzzles[0];
    const found = await composite.getPuzzleById(first.id);
    expect(found?.id).toBe(first.id);
  });
});
