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

export type GridSize = 5 | 10 | 15;

export interface PuzzleDefinition {
  id: string;
  title: string;
  size: GridSize;
  solution: number[];
  rowClues: number[][];
  colClues: number[][];
  difficulty?: 'easy' | 'medium' | 'hard';
  description?: string;
  source?: 'bundled' | 'user-created' | 'imported';
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
