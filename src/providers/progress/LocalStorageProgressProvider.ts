import type { PuzzleProgress, ThemeProgress } from '../../engine/types';
import type { ProgressProvider } from './ProgressProvider';

const STORAGE_KEY = 'nonogram-progress';
const THEME_STORAGE_KEY = 'nonogram-theme-progress';

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

  private getAllThemes(): Record<string, ThemeProgress> {
    try {
      const data = localStorage.getItem(THEME_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private setAllThemes(data: Record<string, ThemeProgress>): void {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(data));
  }

  async getThemeProgress(themeId: string): Promise<ThemeProgress | null> {
    return this.getAllThemes()[themeId] ?? null;
  }

  async saveThemeProgress(progress: ThemeProgress): Promise<void> {
    const all = this.getAllThemes();
    all[progress.themeId] = progress;
    this.setAllThemes(all);
  }

  async getAllThemeProgress(): Promise<ThemeProgress[]> {
    return Object.values(this.getAllThemes());
  }
}
