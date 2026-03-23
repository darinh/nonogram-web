import { CellState } from './types';
import type { CellState as CellStateType, BombConfig, BombResult } from './types';
import { DEFAULT_BOMB_CONFIG } from './constants';

export function getEdgeCells(size: number): number[] {
  const edges = new Set<number>();
  for (let i = 0; i < size; i++) {
    edges.add(i);                         // top row
    edges.add((size - 1) * size + i);     // bottom row
    edges.add(i * size);                  // left col
    edges.add(i * size + (size - 1));     // right col
  }
  return Array.from(edges).sort((a, b) => a - b);
}

export function applyEdgeReveal(grid: CellStateType[], solution: number[], size: number): CellStateType[] {
  const result = [...grid] as CellStateType[];
  for (const idx of getEdgeCells(size)) {
    result[idx] = solution[idx] === 1 ? CellState.Filled : CellState.Crossed;
  }
  return result;
}

export function generateBombTargets(size: number, config?: BombConfig): number[] {
  const cfg = config ?? DEFAULT_BOMB_CONFIG;
  const totalCells = size * size;
  const maxReveal = Math.floor(totalCells * 0.25);
  const revealed = new Set<number>();

  for (let e = 0; e < cfg.explosionCount; e++) {
    if (revealed.size >= maxReveal) break;

    const centerRow = Math.floor(Math.random() * size);
    const centerCol = Math.floor(Math.random() * size);
    const radius = cfg.minRadius + Math.floor(Math.random() * (cfg.maxRadius - cfg.minRadius + 1));

    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const r = centerRow + dr;
        const c = centerCol + dc;
        if (r >= 0 && r < size && c >= 0 && c < size) {
          revealed.add(r * size + c);
          if (revealed.size >= maxReveal) break;
        }
      }
      if (revealed.size >= maxReveal) break;
    }
  }

  return Array.from(revealed).sort((a, b) => a - b);
}

export function applyBomb(grid: CellStateType[], solution: number[], size: number, config?: BombConfig): BombResult {
  const targets = generateBombTargets(size, config);
  const result = [...grid] as CellStateType[];
  for (const idx of targets) {
    result[idx] = solution[idx] === 1 ? CellState.Filled : CellState.Crossed;
  }
  return { grid: result, revealedPositions: targets };
}
