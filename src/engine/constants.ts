import type { Difficulty, BombConfig } from './types';

export const COIN_REWARDS: Record<Difficulty, number> = {
  blue: 5, green: 10, yellow: 20, orange: 35, red: 50,
};

export const HINT_COSTS: Record<Difficulty, number> = {
  blue: 3, green: 5, yellow: 8, orange: 12, red: 15,
};

export const DEFAULT_BOMB_CONFIG: BombConfig = {
  explosionCount: 3, minRadius: 1, maxRadius: 2,
};

export const EDGE_REVEAL_COST = 25;
export const BOMB_COST = 30;
export const MAX_TRANSACTIONS = 100;

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  blue: '#0597F2', green: '#74BF04', yellow: '#BFA004', orange: '#F28705', red: '#F20574',
};
