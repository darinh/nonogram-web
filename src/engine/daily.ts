import { deriveRowClues, deriveColClues } from './clues';
import { isLogicSolvable } from './solver';
import type { PuzzleDefinition } from './types';

// Simple hash function for deterministic seeding
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Seeded PRNG (xorshift)
function createRng(seed: number) {
  let state = seed | 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };
}

/** Get today's date string in YYYY-MM-DD format. */
export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Generate a deterministic daily puzzle for a given date. */
export function generateDailyPuzzle(dateString: string): PuzzleDefinition {
  const seed = hashString('nonogram-daily-' + dateString);
  const rng = createRng(seed);
  const size = 10;

  // Try to generate a logic-solvable puzzle (up to 50 attempts)
  for (let attempt = 0; attempt < 50; attempt++) {
    const solution: number[] = [];
    const density = 0.4 + rng() * 0.2; // 40-60% fill
    for (let i = 0; i < size * size; i++) {
      solution.push(rng() < density ? 1 : 0);
    }

    const rowClues = deriveRowClues(solution, size);
    const colClues = deriveColClues(solution, size);

    if (isLogicSolvable(size, rowClues, colClues)) {
      return {
        id: `daily-${dateString}`,
        title: `Daily Puzzle — ${formatDate(dateString)}`,
        size: size as 10,
        solution,
        rowClues,
        colClues,
        difficulty: 'yellow',
        description: `Daily puzzle for ${formatDate(dateString)}`,
        source: 'bundled',
      };
    }
  }

  // Fallback: return the last attempt even if not logic-solvable
  const solution: number[] = [];
  const density = 0.45;
  const fallbackRng = createRng(seed + 9999);
  for (let i = 0; i < size * size; i++) {
    solution.push(fallbackRng() < density ? 1 : 0);
  }
  const rowClues = deriveRowClues(solution, size);
  const colClues = deriveColClues(solution, size);

  return {
    id: `daily-${dateString}`,
    title: `Daily Puzzle — ${formatDate(dateString)}`,
    size: size as 10,
    solution,
    rowClues,
    colClues,
    difficulty: 'yellow',
    source: 'bundled',
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
