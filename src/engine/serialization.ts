import type { PuzzleDefinition, NonogramExport, GridSize } from './types';
import { deriveRowClues, deriveColClues } from './clues';

/**
 * Serialize a puzzle to a portable JSON string.
 */
export function exportPuzzle(puzzle: PuzzleDefinition): string {
  const exported: NonogramExport = {
    version: 1,
    puzzle: {
      title: puzzle.title,
      size: puzzle.size,
      solution: puzzle.solution,
      rowClues: puzzle.rowClues,
      colClues: puzzle.colClues,
      difficulty: puzzle.difficulty,
      description: puzzle.description,
    },
  };
  return JSON.stringify(exported, null, 2);
}

/**
 * Parse a JSON string into a PuzzleDefinition.
 * Validates structure and generates a unique ID.
 */
export function importPuzzle(data: string): PuzzleDefinition {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    throw new Error('Invalid JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid puzzle format');
  }

  const obj = parsed as Record<string, unknown>;
  if (obj.version !== 1) {
    throw new Error('Unsupported puzzle version');
  }

  const puzzle = obj.puzzle as Record<string, unknown> | undefined;
  if (!puzzle || typeof puzzle !== 'object') {
    throw new Error('Missing puzzle data');
  }

  const size = puzzle.size as number;
  if (size !== 5 && size !== 10 && size !== 15) {
    throw new Error(`Invalid size: ${size}. Must be 5, 10, or 15`);
  }

  const solution = puzzle.solution;
  if (!Array.isArray(solution) || solution.length !== size * size) {
    throw new Error(`Solution must be an array of ${size * size} elements`);
  }

  for (const cell of solution) {
    if (cell !== 0 && cell !== 1) {
      throw new Error('Solution cells must be 0 or 1');
    }
  }

  const title = typeof puzzle.title === 'string' ? puzzle.title : 'Imported Puzzle';
  const difficulty = puzzle.difficulty as string | undefined;
  const description = puzzle.description as string | undefined;

  // Re-derive clues from solution to ensure consistency
  const rowClues = deriveRowClues(solution, size);
  const colClues = deriveColClues(solution, size);

  return {
    id: `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    size: size as GridSize,
    solution,
    rowClues,
    colClues,
    difficulty: difficulty as PuzzleDefinition['difficulty'],
    description,
    source: 'imported',
  };
}

/**
 * Trigger a browser download of a puzzle as a .json file.
 */
export function downloadPuzzleFile(puzzle: PuzzleDefinition, filename?: string): void {
  const json = exportPuzzle(puzzle);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `${puzzle.title.toLowerCase().replace(/\s+/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read an uploaded file as text.
 */
export function readPuzzleFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
