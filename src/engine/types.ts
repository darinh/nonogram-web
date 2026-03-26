export const CellState = {
  Empty: 0,
  Filled: 1,
  Crossed: 2,
} as const;

export type CellState = (typeof CellState)[keyof typeof CellState];

export const Tool = {
  Fill: 'fill',
  Cross: 'cross',
} as const;

export type Tool = (typeof Tool)[keyof typeof Tool];

export type DragMode = 'fill' | 'erase';

// 5-tier difficulty system
export const Difficulty = {
  Blue: 'blue',
  Green: 'green',
  Yellow: 'yellow',
  Orange: 'orange',
  Red: 'red',
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export type GridSize = 5 | 10 | 15;

export interface PuzzleDefinition {
  id: string;
  title: string;
  size: GridSize;
  solution: number[];
  rowClues: number[][];
  colClues: number[][];
  difficulty?: Difficulty;
  description?: string;
  source?: 'bundled' | 'user-created' | 'imported';
}

// Theme system
export interface ThemeDefinition {
  id: string;
  title: string;
  description: string;
  backgroundImage: string; // path to pixel art image
  gridLayout: ThemeGridCell[];
}

export interface ThemeGridCell {
  position: number; // 0-99 (10×10 grid)
  puzzleId: string;
  difficulty: Difficulty;
}

// Coin/wallet system (legacy single-currency)
export interface WalletState {
  coins: number;
  totalEarned: number;
  totalSpent: number;
  transactions: CoinTransaction[];
}

export interface CoinTransaction {
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: string;
}

// Dual-currency wallet system
export interface DualWalletState {
  tokens: number;
  coins: number;
  totalTokensEarned: number;
  totalTokensSpent: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  transactions: EconomyTransaction[];
}

export interface EconomyTransaction {
  type: 'earn' | 'spend';
  currency: 'tokens' | 'coins';
  amount: number;
  reason: string;
  timestamp: string;
}

// Theme progress
export interface ThemeProgress {
  themeId: string;
  completedPuzzles: string[];
  hintsUsed: number;
  powerUpsUsed: number;
}

// Power-ups
export interface BombConfig {
  explosionCount: number; // 2-4
  minRadius: number; // 1
  maxRadius: number; // 2
}

export interface BombResult {
  grid: CellState[];
  revealedPositions: number[];
}

export interface PuzzleProgress {
  puzzleId: string;
  grid: CellState[];
  completed: boolean;
  elapsedTime: number;
  lastPlayed: string;
}

export interface NonogramExport {
  version: 1;
  puzzle: {
    title: string;
    size: GridSize;
    solution: number[];
    rowClues: number[][];
    colClues: number[][];
    difficulty?: string;
    description?: string;
  };
}
