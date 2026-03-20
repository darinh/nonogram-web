import type { PuzzleDefinition } from '../../engine/types';
import type { PuzzleProvider } from './PuzzleProvider';

/**
 * Merges puzzles from multiple providers (e.g., static + localStorage).
 * Deduplicates by ID, with later providers taking precedence.
 */
export class CompositePuzzleProvider implements PuzzleProvider {
  private providers: PuzzleProvider[];

  constructor(providers: PuzzleProvider[]) {
    this.providers = providers;
  }

  async getAllPuzzles(): Promise<PuzzleDefinition[]> {
    const seen = new Map<string, PuzzleDefinition>();

    for (const provider of this.providers) {
      const puzzles = await provider.getAllPuzzles();
      for (const puzzle of puzzles) {
        seen.set(puzzle.id, puzzle);
      }
    }

    return Array.from(seen.values());
  }

  async getPuzzleById(id: string): Promise<PuzzleDefinition | null> {
    // Search providers in reverse order (last provider wins)
    for (let i = this.providers.length - 1; i >= 0; i--) {
      const puzzle = await this.providers[i].getPuzzleById(id);
      if (puzzle) return puzzle;
    }
    return null;
  }

  async savePuzzle(puzzle: PuzzleDefinition): Promise<void> {
    // Save to the last provider that supports saving
    for (let i = this.providers.length - 1; i >= 0; i--) {
      if (this.providers[i].savePuzzle) {
        await this.providers[i].savePuzzle!(puzzle);
        return;
      }
    }
  }

  async deletePuzzle(id: string): Promise<void> {
    for (let i = this.providers.length - 1; i >= 0; i--) {
      if (this.providers[i].deletePuzzle) {
        await this.providers[i].deletePuzzle!(id);
        return;
      }
    }
  }
}
