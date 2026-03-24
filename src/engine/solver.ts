/**
 * Nonogram logic-solvability validator.
 *
 * Uses constraint propagation to determine whether a puzzle
 * can be solved purely by deduction (no guessing required).
 */

/**
 * Generate all valid line placements for given length and clues.
 * Each placement is an array of 0s and 1s.
 */
export function generatePossibleLines(
  length: number,
  clues: number[],
): number[][] {
  // Empty line: clues = [0]
  if (clues.length === 1 && clues[0] === 0) {
    return [new Array(length).fill(0)];
  }

  const results: number[][] = [];
  const line = new Array(length).fill(0);

  function place(clueIdx: number, pos: number): void {
    if (clueIdx === clues.length) {
      // All clues placed — remaining cells must be 0 (already are)
      results.push(line.slice());
      return;
    }

    const clue = clues[clueIdx];
    // Minimum space needed for remaining clues (each clue + 1 gap, except last)
    const spaceNeeded =
      clue +
      clues
        .slice(clueIdx + 1)
        .reduce((sum, c) => sum + 1 + c, 0);
    const maxStart = length - spaceNeeded;

    for (let start = pos; start <= maxStart; start++) {
      // Place the clue block
      for (let i = start; i < start + clue; i++) {
        line[i] = 1;
      }

      place(clueIdx + 1, start + clue + 1);

      // Undo placement
      for (let i = start; i < start + clue; i++) {
        line[i] = 0;
      }
    }
  }

  place(0, 0);
  return results;
}

/**
 * Given partial knowledge of a line and its clues, determine
 * which cells are forced by intersecting all valid possibilities.
 */
export function solveLine(
  known: (number | null)[],
  clues: number[],
): (number | null)[] {
  const possibilities = generatePossibleLines(known.length, clues);

  // Filter to possibilities consistent with current knowledge
  const consistent = possibilities.filter((line) =>
    known.every((val, i) => val === null || val === line[i]),
  );

  if (consistent.length === 0) {
    // No valid placement — return known unchanged (contradiction)
    return known.slice();
  }

  // For each position, if all consistent possibilities agree, the cell is determined
  const result: (number | null)[] = new Array(known.length);
  for (let i = 0; i < known.length; i++) {
    if (known[i] !== null) {
      result[i] = known[i];
    } else {
      const val = consistent[0][i];
      const allAgree = consistent.every((line) => line[i] === val);
      result[i] = allAgree ? val : null;
    }
  }

  return result;
}

/**
 * Check if a puzzle can be solved by pure logic (no guessing).
 * Uses iterative constraint propagation over rows and columns.
 */
export function isLogicSolvable(
  size: number,
  rowClues: number[][],
  colClues: number[][],
): boolean {
  // Initialize grid with all unknowns
  const grid: (number | null)[][] = Array.from({ length: size }, () =>
    new Array(size).fill(null),
  );

  let changed = true;
  while (changed) {
    changed = false;

    // Process rows
    for (let r = 0; r < size; r++) {
      const row = grid[r];
      const solved = solveLine(row, rowClues[r]);
      for (let c = 0; c < size; c++) {
        if (row[c] === null && solved[c] !== null) {
          row[c] = solved[c];
          changed = true;
        }
      }
    }

    // Process columns
    for (let c = 0; c < size; c++) {
      const col: (number | null)[] = new Array(size);
      for (let r = 0; r < size; r++) {
        col[r] = grid[r][c];
      }
      const solved = solveLine(col, colClues[c]);
      for (let r = 0; r < size; r++) {
        if (grid[r][c] === null && solved[r] !== null) {
          grid[r][c] = solved[r];
          changed = true;
        }
      }
    }
  }

  // Check if all cells are determined
  return grid.every((row) => row.every((cell) => cell !== null));
}
