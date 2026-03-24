import { describe, it, expect } from 'vitest';
import {
  generatePossibleLines,
  solveLine,
  isLogicSolvable,
} from '../../engine/solver';
import { heart } from '../../data/puzzles/5x5/heart';
import { star } from '../../data/puzzles/5x5/star';
import { arrow } from '../../data/puzzles/5x5/arrow';
import { house } from '../../data/puzzles/10x10/house';
import { cat } from '../../data/puzzles/10x10/cat';
import { tree } from '../../data/puzzles/10x10/tree';
import { rocket } from '../../data/puzzles/15x15/rocket';
import { flower } from '../../data/puzzles/15x15/flower';
import { gamepad } from '../../data/puzzles/15x15/gamepad';

describe('generatePossibleLines', () => {
  it('returns a single all-zero line for clue [0]', () => {
    const result = generatePossibleLines(5, [0]);
    expect(result).toEqual([[0, 0, 0, 0, 0]]);
  });

  it('returns a single all-filled line for clue equal to length', () => {
    const result = generatePossibleLines(5, [5]);
    expect(result).toEqual([[1, 1, 1, 1, 1]]);
  });

  it('generates correct possibilities for a single clue', () => {
    // clue [2] in length 4: can start at 0, 1, or 2
    const result = generatePossibleLines(4, [2]);
    expect(result).toEqual([
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 1],
    ]);
  });

  it('generates correct possibilities for two clues', () => {
    // clue [1, 1] in length 4: 1_1_, _1_1, 1__1
    const result = generatePossibleLines(4, [1, 1]);
    expect(result).toEqual([
      [1, 0, 1, 0],
      [1, 0, 0, 1],
      [0, 1, 0, 1],
    ]);
  });

  it('generates correct possibilities for multiple clues', () => {
    // clue [1, 1, 1] in length 5: only one possibility
    const result = generatePossibleLines(5, [1, 1, 1]);
    expect(result).toEqual([[1, 0, 1, 0, 1]]);
  });

  it('handles clue [3] in length 5', () => {
    const result = generatePossibleLines(5, [3]);
    expect(result).toEqual([
      [1, 1, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 1, 1],
    ]);
  });

  it('handles clue [2, 1] in length 5', () => {
    const result = generatePossibleLines(5, [2, 1]);
    expect(result).toEqual([
      [1, 1, 0, 1, 0],
      [1, 1, 0, 0, 1],
      [0, 1, 1, 0, 1],
    ]);
  });

  it('returns empty for impossible clues', () => {
    // clue [3, 3] can't fit in length 5 (need at least 7)
    const result = generatePossibleLines(5, [3, 3]);
    expect(result).toEqual([]);
  });

  it('handles length 1 with clue [1]', () => {
    expect(generatePossibleLines(1, [1])).toEqual([[1]]);
  });

  it('handles length 1 with clue [0]', () => {
    expect(generatePossibleLines(1, [0])).toEqual([[0]]);
  });
});

describe('solveLine', () => {
  it('solves a fully unknown line with a single large clue', () => {
    // clue [5] in length 5 → all filled
    const known: (number | null)[] = [null, null, null, null, null];
    const result = solveLine(known, [5]);
    expect(result).toEqual([1, 1, 1, 1, 1]);
  });

  it('solves a fully unknown line with clue [0]', () => {
    const known: (number | null)[] = [null, null, null, null, null];
    const result = solveLine(known, [0]);
    expect(result).toEqual([0, 0, 0, 0, 0]);
  });

  it('determines overlap cells for a centered clue', () => {
    // clue [3] in length 5: possibilities are positions 0-2, 1-3, 2-4
    // position 2 must always be filled
    const known: (number | null)[] = [null, null, null, null, null];
    const result = solveLine(known, [3]);
    expect(result).toEqual([null, null, 1, null, null]);
  });

  it('uses existing knowledge to narrow possibilities', () => {
    // clue [2] in length 4, knowing position 0 is filled
    // possible: [1,1,0,0] — only this matches since pos 0 is filled
    const known: (number | null)[] = [1, null, null, null];
    const result = solveLine(known, [2]);
    expect(result).toEqual([1, 1, 0, 0]);
  });

  it('uses existing empty knowledge to narrow possibilities', () => {
    // clue [2] in length 4, knowing position 0 is empty
    // possible: [0,1,1,0] or [0,0,1,1]
    const known: (number | null)[] = [0, null, null, null];
    const result = solveLine(known, [2]);
    // position 0 empty, position 2 forced filled, rest unknown
    expect(result).toEqual([0, null, 1, null]);
  });

  it('returns already-solved line unchanged', () => {
    const known: (number | null)[] = [1, 1, 0, 1, 0];
    const result = solveLine(known, [2, 1]);
    expect(result).toEqual([1, 1, 0, 1, 0]);
  });

  it('determines forced empty cells', () => {
    // clue [1, 1, 1] in length 5: only possibility [1,0,1,0,1]
    const known: (number | null)[] = [null, null, null, null, null];
    const result = solveLine(known, [1, 1, 1]);
    expect(result).toEqual([1, 0, 1, 0, 1]);
  });
});

describe('isLogicSolvable', () => {
  describe('5x5 puzzles', () => {
    it('solves the heart puzzle', () => {
      expect(
        isLogicSolvable(heart.size, heart.rowClues, heart.colClues),
      ).toBe(true);
    });

    it('solves the star puzzle', () => {
      expect(
        isLogicSolvable(star.size, star.rowClues, star.colClues),
      ).toBe(true);
    });

    it('solves the arrow puzzle', () => {
      expect(
        isLogicSolvable(arrow.size, arrow.rowClues, arrow.colClues),
      ).toBe(true);
    });
  });

  describe('10x10 puzzles', () => {
    it('solves the house puzzle', () => {
      expect(
        isLogicSolvable(house.size, house.rowClues, house.colClues),
      ).toBe(true);
    });

    it('solves the cat puzzle', () => {
      expect(
        isLogicSolvable(cat.size, cat.rowClues, cat.colClues),
      ).toBe(true);
    });

    it('solves the tree puzzle', () => {
      expect(
        isLogicSolvable(tree.size, tree.rowClues, tree.colClues),
      ).toBe(true);
    });
  });

  describe('15x15 puzzles', () => {
    it('detects that the rocket puzzle requires more than line-by-line deduction', () => {
      // The rocket puzzle has interdependent cells at the fins (rows 11/13, cols 1-2/12-13)
      // that simple constraint propagation cannot resolve without probing/backtracking
      expect(
        isLogicSolvable(rocket.size, rocket.rowClues, rocket.colClues),
      ).toBe(false);
    });

    it('solves the flower puzzle', () => {
      expect(
        isLogicSolvable(flower.size, flower.rowClues, flower.colClues),
      ).toBe(true);
    });

    it('solves the gamepad puzzle', () => {
      expect(
        isLogicSolvable(gamepad.size, gamepad.rowClues, gamepad.colClues),
      ).toBe(true);
    });
  });

  it('detects non-logic-solvable puzzle (ambiguous)', () => {
    // A 2x2 puzzle with clues [1],[1] for both rows and both cols
    // has two solutions: diagonal top-left or diagonal top-right
    // This cannot be resolved by constraint propagation alone
    const size = 2;
    const rowClues = [[1], [1]];
    const colClues = [[1], [1]];
    expect(isLogicSolvable(size, rowClues, colClues)).toBe(false);
  });

  it('solves a trivially empty puzzle', () => {
    const size = 3;
    const rowClues = [[0], [0], [0]];
    const colClues = [[0], [0], [0]];
    expect(isLogicSolvable(size, rowClues, colClues)).toBe(true);
  });

  it('solves a trivially full puzzle', () => {
    const size = 3;
    const rowClues = [[3], [3], [3]];
    const colClues = [[3], [3], [3]];
    expect(isLogicSolvable(size, rowClues, colClues)).toBe(true);
  });
});
