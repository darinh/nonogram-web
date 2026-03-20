import type { PuzzleDefinition } from '../../engine/types';
import type { PuzzleProvider } from './PuzzleProvider';
import { bundledPuzzles } from '../../data/puzzles';

export class StaticPuzzleProvider implements PuzzleProvider {
  async getAllPuzzles(): Promise<PuzzleDefinition[]> {
    return bundledPuzzles;
  }

  async getPuzzleById(id: string): Promise<PuzzleDefinition | null> {
    return bundledPuzzles.find(p => p.id === id) ?? null;
  }
}
