import type { PuzzleProgress } from '../../engine/types';

export interface ProgressProvider {
  getProgress(puzzleId: string): Promise<PuzzleProgress | null>;
  saveProgress(progress: PuzzleProgress): Promise<void>;
  getAllProgress(): Promise<PuzzleProgress[]>;
  clearProgress(puzzleId: string): Promise<void>;
}
