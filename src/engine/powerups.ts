import { CellState } from './types';
import type { CellState as CellStateType, BombConfig, BombResult } from './types';

/**
 * Returns a sorted array of all perimeter (edge) cell indices for a size×size grid.
 * Formula: 4 * size - 4 cells for size >= 2.
 */
export function getEdgeCells(size: number): number[] {
  if (size <= 0) return [];
  if (size === 1) return [0];

  const edges = new Set<number>();

  // Top row
  for (let c = 0; c < size; c++) {
    edges.add(c);
  }
  // Bottom row
  for (let c = 0; c < size; c++) {
    edges.add((size - 1) * size + c);
  }
  // Left column (excluding corners already counted)
  for (let r = 1; r < size - 1; r++) {
    edges.add(r * size);
  }
  // Right column (excluding corners already counted)
  for (let r = 1; r < size - 1; r++) {
    edges.add(r * size + (size - 1));
  }

  return Array.from(edges).sort((a, b) => a - b);
}

/**
 * Reveals all edge cells in a copy of the grid according to the solution.
 * Filled cells (solution=1) → CellState.Filled, empty (solution=0) → CellState.Crossed.
 */
export function applyEdgeReveal(
  grid: CellStateType[],
  solution: number[],
  size: number,
): CellStateType[] {
  const newGrid = [...grid] as CellStateType[];
  const edgeCells = getEdgeCells(size);

  for (const i of edgeCells) {
    if (solution[i] === 1) {
      newGrid[i] = CellState.Filled;
    } else {
      newGrid[i] = CellState.Crossed;
    }
  }

  return newGrid;
}

/**
 * Selects `count` distinct unrevealed (Empty) cell indices at random.
 * Uses the provided rng function (returns [0, 1)) for deterministic testing.
 */
export function selectBombTargets(
  grid: CellStateType[],
  size: number,
  count: number,
  rng: () => number = Math.random,
): number[] {
  const unrevealed: number[] = [];
  for (let i = 0; i < size * size; i++) {
    if (grid[i] === CellState.Empty) {
      unrevealed.push(i);
    }
  }

  if (unrevealed.length <= count) {
    return [...unrevealed];
  }

  // Fisher-Yates partial shuffle to pick `count` distinct indices
  const available = [...unrevealed];
  const selected: number[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * available.length);
    selected.push(available[idx]);
    // Swap with last and pop to avoid re-selection
    available[idx] = available[available.length - 1];
    available.pop();
  }

  return selected;
}

/**
 * Returns sorted indices of all cells within Manhattan distance `radius` of center,
 * clamped to grid bounds.
 */
export function getBlastRadius(
  center: number,
  size: number,
  radius: number,
): number[] {
  const centerRow = Math.floor(center / size);
  const centerCol = center % size;
  const cells: number[] = [];

  for (let r = centerRow - radius; r <= centerRow + radius; r++) {
    if (r < 0 || r >= size) continue;
    for (let c = centerCol - radius; c <= centerCol + radius; c++) {
      if (c < 0 || c >= size) continue;
      if (Math.abs(r - centerRow) + Math.abs(c - centerCol) <= radius) {
        cells.push(r * size + c);
      }
    }
  }

  return cells.sort((a, b) => a - b);
}

/**
 * Applies a bomb power-up: selects random targets, computes blast radii,
 * reveals cells (capped at 20% of grid), and returns the new grid + revealed positions.
 */
export function applyBomb(
  grid: CellStateType[],
  solution: number[],
  size: number,
  config: BombConfig,
  rng: () => number = Math.random,
): BombResult {
  const targets = selectBombTargets(grid, size, config.explosionCount, rng);

  if (targets.length === 0) {
    return { grid: [...grid] as CellStateType[], revealedPositions: [] };
  }

  // Collect blast cells in order of bombs processed, preserving insertion order for cap
  const maxReveal = Math.floor(0.2 * size * size);
  const revealedSet = new Set<number>();
  const revealedOrder: number[] = [];

  for (const target of targets) {
    const radius =
      config.minRadius +
      Math.floor(rng() * (config.maxRadius - config.minRadius + 1));
    const blastCells = getBlastRadius(target, size, radius);

    for (const cell of blastCells) {
      if (!revealedSet.has(cell)) {
        revealedSet.add(cell);
        revealedOrder.push(cell);
      }
    }
  }

  // Cap at 20% of grid
  const toReveal = revealedOrder.slice(0, maxReveal);

  // Apply reveals
  const newGrid = [...grid] as CellStateType[];
  for (const i of toReveal) {
    if (solution[i] === 1) {
      newGrid[i] = CellState.Filled;
    } else {
      newGrid[i] = CellState.Crossed;
    }
  }

  return {
    grid: newGrid,
    revealedPositions: [...toReveal].sort((a, b) => a - b),
  };
}
