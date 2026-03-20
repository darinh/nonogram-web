import type { PuzzleDefinition } from '../../engine/types';

export interface PuzzleProvider {
  getAllPuzzles(): Promise<PuzzleDefinition[]>;
  getPuzzleById(id: string): Promise<PuzzleDefinition | null>;
  savePuzzle?(puzzle: PuzzleDefinition): Promise<void>;
  deletePuzzle?(id: string): Promise<void>;
}
