import { describe, it, expect } from 'vitest';
import {
  getDifficultyColor,
  getDifficultyLabel,
  getDifficultyOrder,
  suggestGridSize,
} from '../../engine/difficulty';
import type { Difficulty } from '../../engine/types';

const ALL_DIFFICULTIES: Difficulty[] = ['blue', 'green', 'yellow', 'orange', 'red'];

describe('getDifficultyColor', () => {
  it('returns a hex color for each difficulty', () => {
    const expected: Record<Difficulty, string> = {
      blue: '#3B82F6',
      green: '#22C55E',
      yellow: '#EAB308',
      orange: '#F97316',
      red: '#EF4444',
    };
    for (const d of ALL_DIFFICULTIES) {
      expect(getDifficultyColor(d)).toBe(expected[d]);
    }
  });
});

describe('getDifficultyLabel', () => {
  it('returns the correct label for each difficulty', () => {
    expect(getDifficultyLabel('blue')).toBe('Easiest');
    expect(getDifficultyLabel('green')).toBe('Easy');
    expect(getDifficultyLabel('yellow')).toBe('Normal');
    expect(getDifficultyLabel('orange')).toBe('Difficult');
    expect(getDifficultyLabel('red')).toBe('Expert');
  });
});

describe('getDifficultyOrder', () => {
  it('returns increasing order values', () => {
    const orders = ALL_DIFFICULTIES.map(getDifficultyOrder);
    expect(orders).toEqual([0, 1, 2, 3, 4]);
  });

  it('can be used to sort difficulties', () => {
    const shuffled: Difficulty[] = ['red', 'blue', 'orange', 'green', 'yellow'];
    const sorted = [...shuffled].sort((a, b) => getDifficultyOrder(a) - getDifficultyOrder(b));
    expect(sorted).toEqual(['blue', 'green', 'yellow', 'orange', 'red']);
  });
});

describe('suggestGridSize', () => {
  it('suggests correct grid sizes', () => {
    expect(suggestGridSize('blue')).toBe(5);
    expect(suggestGridSize('green')).toBe(5);
    expect(suggestGridSize('yellow')).toBe(10);
    expect(suggestGridSize('orange')).toBe(10);
    expect(suggestGridSize('red')).toBe(15);
  });
});
