/**
 * Derive row clues from a flat solution array.
 * Scans each row left-to-right, counting consecutive filled (1) cells.
 */
export function deriveRowClues(solution: number[], size: number): number[][] {
  const clues: number[][] = [];

  for (let row = 0; row < size; row++) {
    const rowClue: number[] = [];
    let count = 0;

    for (let col = 0; col < size; col++) {
      if (solution[row * size + col] === 1) {
        count++;
      } else {
        if (count > 0) {
          rowClue.push(count);
          count = 0;
        }
      }
    }

    if (count > 0) rowClue.push(count);
    clues.push(rowClue.length > 0 ? rowClue : [0]);
  }

  return clues;
}

/**
 * Derive column clues from a flat solution array.
 * Scans each column top-to-bottom, counting consecutive filled (1) cells.
 */
export function deriveColClues(solution: number[], size: number): number[][] {
  const clues: number[][] = [];

  for (let col = 0; col < size; col++) {
    const colClue: number[] = [];
    let count = 0;

    for (let row = 0; row < size; row++) {
      if (solution[row * size + col] === 1) {
        count++;
      } else {
        if (count > 0) {
          colClue.push(count);
          count = 0;
        }
      }
    }

    if (count > 0) colClue.push(count);
    clues.push(colClue.length > 0 ? colClue : [0]);
  }

  return clues;
}
