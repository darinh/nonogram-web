import type { PuzzleProgress, ThemeProgress } from '../../engine/types';
import type { ProgressProvider } from './ProgressProvider';
import type { StreakData } from './ProgressProvider';

const STORAGE_KEY = 'nonogram-progress';
const THEME_STORAGE_KEY = 'nonogram-theme-progress';
const STREAK_STORAGE_KEY = 'nonogram_streak';

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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
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
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
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

  private getStreakData(): StreakData {
    try {
      const data = localStorage.getItem(STREAK_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch { /* ignore */ }
    return { current: 0, longest: 0, lastDate: '' };
  }

  private setStreakData(data: StreakData): void {
    try {
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  async getStreak(): Promise<StreakData> {
    return this.getStreakData();
  }

  async recordDailyCompletion(date: string): Promise<void> {
    const streak = this.getStreakData();

    if (streak.lastDate === date) return;

    if (streak.lastDate === getYesterday(date)) {
      streak.current += 1;
    } else {
      streak.current = 1;
    }

    streak.longest = Math.max(streak.longest, streak.current);
    streak.lastDate = date;
    this.setStreakData(streak);
  }
}

function getYesterday(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}
