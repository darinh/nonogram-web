import type { PuzzleProvider } from './PuzzleProvider';
import type { PuzzleDefinition } from '../../engine/types';
import { generateDailyPuzzle, getTodayDateString } from '../../engine/daily';

export class DailyPuzzleProvider implements PuzzleProvider {
  async getAllPuzzles(): Promise<PuzzleDefinition[]> {
    return [generateDailyPuzzle(getTodayDateString())];
  }

  async getPuzzleById(id: string): Promise<PuzzleDefinition | null> {
    if (!id.startsWith('daily-')) return null;
    const dateStr = id.replace('daily-', '');
    return generateDailyPuzzle(dateStr);
  }
}
