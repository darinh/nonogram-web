import type { PuzzleProgress } from '../../engine/types';
import type { ProgressProvider } from './ProgressProvider';

const STORAGE_KEY = 'nonogram-progress';

export class LocalStorageProgressProvider implements ProgressProvider {
  private getAll(): Record<string, PuzzleProgress> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private setAll(data: Record<string, PuzzleProgress>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async getProgress(puzzleId: string): Promise<PuzzleProgress | null> {
    return this.getAll()[puzzleId] ?? null;
  }

  async saveProgress(progress: PuzzleProgress): Promise<void> {
    const all = this.getAll();
    all[progress.puzzleId] = progress;
    this.setAll(all);
  }

  async getAllProgress(): Promise<PuzzleProgress[]> {
    return Object.values(this.getAll());
  }

  async clearProgress(puzzleId: string): Promise<void> {
    const all = this.getAll();
    delete all[puzzleId];
    this.setAll(all);
  }
}
