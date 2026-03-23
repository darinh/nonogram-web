import { describe, it, expect } from 'vitest';
import { Difficulty } from '../../engine/types';
import { COIN_REWARDS, HINT_COSTS, DEFAULT_BOMB_CONFIG } from '../../engine/constants';

const allDifficulties = Object.values(Difficulty);

describe('constants', () => {
  it('COIN_REWARDS has entries for all difficulties', () => {
    for (const d of allDifficulties) {
      expect(COIN_REWARDS[d]).toBeDefined();
      expect(typeof COIN_REWARDS[d]).toBe('number');
    }
  });

  it('HINT_COSTS has entries for all difficulties', () => {
    for (const d of allDifficulties) {
      expect(HINT_COSTS[d]).toBeDefined();
      expect(typeof HINT_COSTS[d]).toBe('number');
    }
  });

  it('COIN_REWARDS increase with difficulty', () => {
    const ordered = [
      COIN_REWARDS.blue,
      COIN_REWARDS.green,
      COIN_REWARDS.yellow,
      COIN_REWARDS.orange,
      COIN_REWARDS.red,
    ];
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i]).toBeGreaterThan(ordered[i - 1]);
    }
  });

  it('DEFAULT_BOMB_CONFIG has reasonable values', () => {
    expect(DEFAULT_BOMB_CONFIG.explosionCount).toBeGreaterThanOrEqual(2);
    expect(DEFAULT_BOMB_CONFIG.explosionCount).toBeLessThanOrEqual(4);
    expect(DEFAULT_BOMB_CONFIG.minRadius).toBeGreaterThanOrEqual(1);
    expect(DEFAULT_BOMB_CONFIG.maxRadius).toBeGreaterThanOrEqual(DEFAULT_BOMB_CONFIG.minRadius);
  });
});
