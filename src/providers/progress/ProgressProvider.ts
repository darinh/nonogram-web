import type { PuzzleProgress, ThemeProgress } from '../../engine/types';

export interface ProgressProvider {
  getProgress(puzzleId: string): Promise<PuzzleProgress | null>;
  saveProgress(progress: PuzzleProgress): Promise<void>;
  getAllProgress(): Promise<PuzzleProgress[]>;
  clearProgress(puzzleId: string): Promise<void>;
  getThemeProgress(themeId: string): Promise<ThemeProgress | null>;
  saveThemeProgress(progress: ThemeProgress): Promise<void>;
  getAllThemeProgress(): Promise<ThemeProgress[]>;
}
