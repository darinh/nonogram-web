import type { PuzzleDefinition } from '../../engine/types';
import type { PuzzleProvider } from './PuzzleProvider';

const STORAGE_KEY = 'nonogram-user-puzzles';

export class LocalStoragePuzzleProvider implements PuzzleProvider {
  private getPuzzles(): PuzzleDefinition[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setPuzzles(puzzles: PuzzleDefinition[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(puzzles));
  }

  async getAllPuzzles(): Promise<PuzzleDefinition[]> {
    return this.getPuzzles();
  }

  async getPuzzleById(id: string): Promise<PuzzleDefinition | null> {
    return this.getPuzzles().find(p => p.id === id) ?? null;
  }

  async savePuzzle(puzzle: PuzzleDefinition): Promise<void> {
    const puzzles = this.getPuzzles();
    const index = puzzles.findIndex(p => p.id === puzzle.id);
    if (index >= 0) {
      puzzles[index] = puzzle;
    } else {
      puzzles.push(puzzle);
    }
    this.setPuzzles(puzzles);
  }

  async deletePuzzle(id: string): Promise<void> {
    const puzzles = this.getPuzzles().filter(p => p.id !== id);
    this.setPuzzles(puzzles);
  }
}
