#!/usr/bin/env npx tsx
/**
 * Batch nonogram puzzle generator.
 *
 * Usage:
 *   npx tsx scripts/generate-puzzles.ts \
 *     --count 20 --size 5 --prefix "Nature" \
 *     --output src/data/themes/nature-5x5.ts
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { deriveRowClues, deriveColClues } from '../src/engine/clues.js';

// ── Types that will eventually live in src/engine/types.ts ───────────────────
// Once ThemeDefinition / Difficulty are added to the engine, import them instead.
type GridSize = 5 | 10 | 15;

interface PuzzleDefinition {
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
// ─────────────────────────────────────────────────────────────────────────────

// ── Deterministic PRNG (xorshift32) ─────────────────────────────────────────
export function createRng(seed: number) {
  let state = seed | 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };
}

// Module-level RNG used by generatePuzzle; seeded on first call.
let moduleRng: (() => number) | null = null;

/** Seed (or re-seed) the module-level RNG used by generatePuzzle. */
export function seedRng(seed: number) {
  moduleRng = createRng(seed);
}

function rng(): number {
  if (!moduleRng) moduleRng = createRng(Math.floor(Math.random() * 0x7fffffff));
  return moduleRng();
}

// ── Grid helpers ────────────────────────────────────────────────────────────
function createRandomGrid(size: number): number[] {
  const targetDensity = 0.3 + rng() * 0.3; // 30–60%
  return Array.from({ length: size * size }, () =>
    rng() < targetDensity ? 1 : 0,
  );
}

function cellularAutomataSmooth(grid: number[], size: number): number[] {
  const next = [...grid];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let neighbors = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            neighbors += grid[nr * size + nc];
          }
        }
      }
      // Game-of-Life–inspired rules tuned for nonogram interest
      const alive = grid[r * size + c] === 1;
      if (alive) {
        next[r * size + c] = neighbors >= 2 && neighbors <= 5 ? 1 : 0;
      } else {
        next[r * size + c] = neighbors >= 3 && neighbors <= 4 ? 1 : 0;
      }
    }
  }
  return next;
}

type SymmetryKind = 'horizontal' | 'vertical' | 'both';

function applySymmetry(
  grid: number[],
  size: number,
  kind: SymmetryKind,
): number[] {
  const out = [...grid];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (kind === 'horizontal' || kind === 'both') {
        const mr = size - 1 - r;
        if (r < mr) out[mr * size + c] = out[r * size + c];
      }
      if (kind === 'vertical' || kind === 'both') {
        const mc = size - 1 - c;
        if (c < mc) out[r * size + mc] = out[r * size + c];
      }
    }
  }
  return out;
}

function hasEmptyOrFullLine(grid: number[], size: number): boolean {
  for (let i = 0; i < size; i++) {
    let rowSum = 0;
    let colSum = 0;
    for (let j = 0; j < size; j++) {
      rowSum += grid[i * size + j];
      colSum += grid[j * size + i];
    }
    if (rowSum === 0 || rowSum === size) return true;
    if (colSum === 0 || colSum === size) return true;
  }
  return false;
}

function density(grid: number[]): number {
  return grid.reduce((s, v) => s + v, 0) / grid.length;
}

// ── Puzzle generation (exported for use by generate-theme.ts) ───────────────
export function generatePuzzle(
  size: GridSize,
  useSymmetry: boolean,
): number[] {
  const MAX_ATTEMPTS = 100;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let grid = createRandomGrid(size);

    // Apply 1–2 rounds of cellular automata smoothing
    const passes = size <= 5 ? 1 : 2;
    for (let i = 0; i < passes; i++) {
      grid = cellularAutomataSmooth(grid, size);
    }

    if (useSymmetry) {
      const kinds: SymmetryKind[] = ['horizontal', 'vertical', 'both'];
      const kind = kinds[Math.floor(rng() * kinds.length)];
      grid = applySymmetry(grid, size, kind);
    }

    const d = density(grid);
    if (d < 0.25 || d > 0.65) continue;
    if (hasEmptyOrFullLine(grid, size)) continue;

    return grid;
  }
  // Fallback: return a simple diagonal/block pattern
  return createFallbackGrid(size);
}

function createFallbackGrid(size: number): number[] {
  const grid = new Array(size * size).fill(0);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r + c) % 2 === 0 || (r > 1 && r < size - 1 && c > 1 && c < size - 1)) {
        grid[r * size + c] = 1;
      }
    }
  }
  return grid;
}

function toPuzzleDefinition(
  grid: number[],
  size: GridSize,
  index: number,
  prefix: string,
): PuzzleDefinition {
  const id = `${prefix.toLowerCase().replace(/\s+/g, '-')}-${size}x${size}-${String(index).padStart(3, '0')}`;
  return {
    id,
    title: `${prefix} #${index}`,
    size,
    solution: grid,
    rowClues: deriveRowClues(grid, size),
    colClues: deriveColClues(grid, size),
    source: 'bundled',
  };
}

// ── CLI entry point (only runs when executed directly) ──────────────────────
const isMain =
  resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);

if (isMain) {
  const { values } = parseArgs({
    options: {
      count: { type: 'string', short: 'c', default: '10' },
      size: { type: 'string', short: 's', default: '5' },
      prefix: { type: 'string', short: 'p', default: 'Puzzle' },
      output: { type: 'string', short: 'o', default: 'puzzles.ts' },
      symmetry: { type: 'string', default: '30' }, // % of puzzles with symmetry
      seed: { type: 'string', default: '' },
    },
    strict: true,
  });

  const COUNT = parseInt(values.count!, 10);
  const SIZE = parseInt(values.size!, 10) as GridSize;
  const PREFIX = values.prefix!;
  const OUTPUT = values.output!;
  const SYMMETRY_PCT = parseInt(values.symmetry!, 10);

  if (![5, 10, 15].includes(SIZE)) {
    console.error('Error: --size must be 5, 10, or 15');
    process.exit(1);
  }
  if (COUNT < 1) {
    console.error('Error: --count must be >= 1');
    process.exit(1);
  }

  const globalSeed = values.seed
    ? parseInt(values.seed, 10)
    : Math.floor(Math.random() * 0x7fffffff);
  seedRng(globalSeed);

  console.log(
    `Generating ${COUNT} puzzles (${SIZE}×${SIZE}, prefix="${PREFIX}", seed=${globalSeed})...`,
  );

  const puzzles: PuzzleDefinition[] = [];
  for (let i = 1; i <= COUNT; i++) {
    const useSymmetry = rng() * 100 < SYMMETRY_PCT;
    const grid = generatePuzzle(SIZE, useSymmetry);
    puzzles.push(toPuzzleDefinition(grid, SIZE, i, PREFIX));
  }

  const output = formatOutput(puzzles);
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, output, 'utf-8');
  console.log(`Wrote ${puzzles.length} puzzles to ${OUTPUT}`);
}

function formatOutput(puzzles: PuzzleDefinition[]): string {
  const lines: string[] = [
    "import type { PuzzleDefinition } from '../../engine/types';",
    '',
    `export const puzzles: PuzzleDefinition[] = ${JSON.stringify(puzzles, null, 2)};`,
    '',
  ];
  return lines.join('\n');
}
