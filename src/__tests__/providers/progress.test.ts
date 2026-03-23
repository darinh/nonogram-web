import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageProgressProvider } from '../../providers/progress/LocalStorageProgressProvider';
import { CellState } from '../../engine/types';
import type { PuzzleProgress, ThemeProgress } from '../../engine/types';

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

describe('LocalStorageProgressProvider', () => {
  const provider = new LocalStorageProgressProvider();
  const sampleProgress: PuzzleProgress = {
    puzzleId: 'test-1',
    grid: [CellState.Filled, CellState.Empty, CellState.Crossed],
    completed: false,
    elapsedTime: 120,
    lastPlayed: '2024-01-01T00:00:00.000Z',
  };

  it('returns null for missing progress', async () => {
    const result = await provider.getProgress('nonexistent');
    expect(result).toBeNull();
  });

  it('saves and retrieves progress', async () => {
    await provider.saveProgress(sampleProgress);
    const result = await provider.getProgress('test-1');
    expect(result).toEqual(sampleProgress);
  });

  it('updates existing progress', async () => {
    await provider.saveProgress(sampleProgress);
    const updated = { ...sampleProgress, completed: true, elapsedTime: 240 };
    await provider.saveProgress(updated);
    const result = await provider.getProgress('test-1');
    expect(result?.completed).toBe(true);
    expect(result?.elapsedTime).toBe(240);
  });

  it('returns all progress entries', async () => {
    await provider.saveProgress(sampleProgress);
    await provider.saveProgress({ ...sampleProgress, puzzleId: 'test-2' });
    const all = await provider.getAllProgress();
    expect(all).toHaveLength(2);
  });

  it('clears progress for a specific puzzle', async () => {
    await provider.saveProgress(sampleProgress);
    await provider.saveProgress({ ...sampleProgress, puzzleId: 'test-2' });
    await provider.clearProgress('test-1');
    expect(await provider.getProgress('test-1')).toBeNull();
    expect(await provider.getProgress('test-2')).not.toBeNull();
  });
});

describe('LocalStorageProgressProvider - theme progress', () => {
  const provider = new LocalStorageProgressProvider();
  const sampleThemeProgress: ThemeProgress = {
    themeId: 'theme-1',
    completedPuzzles: ['puzzle-1', 'puzzle-2'],
    hintsUsed: 3,
    powerUpsUsed: 1,
  };

  it('returns null for missing theme progress', async () => {
    const result = await provider.getThemeProgress('nonexistent');
    expect(result).toBeNull();
  });

  it('saves and retrieves theme progress', async () => {
    await provider.saveThemeProgress(sampleThemeProgress);
    const result = await provider.getThemeProgress('theme-1');
    expect(result).toEqual(sampleThemeProgress);
  });

  it('returns all theme progress entries', async () => {
    await provider.saveThemeProgress(sampleThemeProgress);
    await provider.saveThemeProgress({ ...sampleThemeProgress, themeId: 'theme-2' });
    const all = await provider.getAllThemeProgress();
    expect(all).toHaveLength(2);
  });
});
