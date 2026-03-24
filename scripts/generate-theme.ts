#!/usr/bin/env npx tsx
/**
 * Full theme generator — produces a ThemeDefinition file with 100 puzzles
 * distributed across five difficulty tiers.
 *
 * Usage:
 *   npx tsx scripts/generate-theme.ts \
 *     --name "Nature" --id nature --output src/data/themes/nature.ts
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { deriveRowClues, deriveColClues } from '../src/engine/clues.js';
import { isLogicSolvable } from '../src/engine/solver.js';
import { generatePuzzle } from './generate-puzzles.js';

// ── Types that will eventually live in src/engine/types.ts ───────────────────
// Once ThemeDefinition / ThemeGridCell / Difficulty are added, import them instead.
type GridSize = 5 | 10 | 15;
type Difficulty = 'blue' | 'green' | 'yellow' | 'orange' | 'red';

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

interface ThemeGridCell {
  puzzleId: string;
  difficulty: Difficulty;
}

interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  grid: (ThemeGridCell | null)[][];
  puzzles: PuzzleDefinition[];
}
// ─────────────────────────────────────────────────────────────────────────────

// ── CLI argument parsing ────────────────────────────────────────────────────
const { values } = parseArgs({
  options: {
    name: { type: 'string', short: 'n', default: 'Theme' },
    id: { type: 'string', default: '' },
    description: { type: 'string', short: 'd', default: '' },
    icon: { type: 'string', default: '🧩' },
    output: { type: 'string', short: 'o', default: 'theme.ts' },
    seed: { type: 'string', default: '' },
  },
  strict: true,
});

const NAME = values.name!;
const ID = values.id || NAME.toLowerCase().replace(/\s+/g, '-');
const DESCRIPTION =
  values.description || `A collection of ${NAME}-themed nonogram puzzles`;
const ICON = values.icon!;
const OUTPUT = values.output!;

// ── PRNG ────────────────────────────────────────────────────────────────────
function createRng(seed: number) {
  let state = seed | 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };
}

const globalSeed = values.seed
  ? parseInt(values.seed!, 10)
  : Math.floor(Math.random() * 0x7fffffff);
const rng = createRng(globalSeed);

// ── Difficulty tiers ────────────────────────────────────────────────────────
interface Tier {
  difficulty: Difficulty;
  count: number;
  size: GridSize;
  puzzleDifficulty: 'easy' | 'medium' | 'hard';
}

const TIERS: Tier[] = [
  { difficulty: 'blue', count: 20, size: 5, puzzleDifficulty: 'easy' },
  { difficulty: 'green', count: 25, size: 5, puzzleDifficulty: 'easy' },
  { difficulty: 'yellow', count: 25, size: 10, puzzleDifficulty: 'medium' },
  { difficulty: 'orange', count: 20, size: 10, puzzleDifficulty: 'medium' },
  { difficulty: 'red', count: 10, size: 15, puzzleDifficulty: 'hard' },
];

// Randomly upgrade some green puzzles to 10×10 and some orange to 15×15
function tierSize(tier: Tier): GridSize {
  if (tier.difficulty === 'green' && rng() < 0.4) return 10;
  if (tier.difficulty === 'orange' && rng() < 0.3) return 15;
  return tier.size;
}

// ── Grid distribution ───────────────────────────────────────────────────────
function distribute(puzzleIds: { id: string; difficulty: Difficulty }[]): (ThemeGridCell | null)[][] {
  const GRID_SIZE = 10;
  const grid: (ThemeGridCell | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null),
  );

  // Create shuffled list of all 100 positions
  const positions: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      positions.push([r, c]);
    }
  }
  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  for (let i = 0; i < puzzleIds.length && i < positions.length; i++) {
    const [r, c] = positions[i];
    grid[r][c] = {
      puzzleId: puzzleIds[i].id,
      difficulty: puzzleIds[i].difficulty,
    };
  }

  return grid;
}

// ── Main ────────────────────────────────────────────────────────────────────
function main() {
  console.log(`Generating theme "${NAME}" (id=${ID}, seed=${globalSeed})...`);

  const allPuzzles: PuzzleDefinition[] = [];
  const gridEntries: { id: string; difficulty: Difficulty }[] = [];
  let globalIndex = 1;
  let passedCount = 0;
  let failedCount = 0;

  for (const tier of TIERS) {
    console.log(
      `  Tier ${tier.difficulty}: ${tier.count} puzzles (base ${tier.size}×${tier.size})`,
    );
    for (let i = 0; i < tier.count; i++) {
      const size = tierSize(tier);
      let solution: number[] | null = null;
      let solvable = false;

      for (let attempt = 0; attempt < 10; attempt++) {
        const useSymmetry = rng() < 0.3;
        const candidate = generatePuzzle(size, useSymmetry);
        const rowClues = deriveRowClues(candidate, size);
        const colClues = deriveColClues(candidate, size);
        if (isLogicSolvable(size, rowClues, colClues)) {
          solution = candidate;
          solvable = true;
          break;
        }
        solution = candidate;
      }

      if (solvable) {
        passedCount++;
      } else {
        failedCount++;
      }

      const id = `${ID}-${String(globalIndex).padStart(3, '0')}`;
      const puzzle: PuzzleDefinition = {
        id,
        title: `${NAME} #${globalIndex}`,
        size,
        solution: solution!,
        rowClues: deriveRowClues(solution!, size),
        colClues: deriveColClues(solution!, size),
        difficulty: tier.puzzleDifficulty,
        source: 'bundled',
      };
      allPuzzles.push(puzzle);
      gridEntries.push({ id, difficulty: tier.difficulty });
      globalIndex++;
    }
  }

  console.log(`Logic-solvability: ${passedCount} passed, ${failedCount} failed (out of ${allPuzzles.length})`);

  const themeGrid = distribute(gridEntries);

  const theme: ThemeDefinition = {
    id: ID,
    name: NAME,
    description: DESCRIPTION,
    icon: ICON,
    grid: themeGrid,
    puzzles: allPuzzles,
  };

  const output = formatThemeOutput(theme);
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, output, 'utf-8');
  console.log(
    `Wrote theme with ${allPuzzles.length} puzzles to ${OUTPUT}`,
  );
}

function formatThemeOutput(theme: ThemeDefinition): string {
  const lines: string[] = [
    "import type { PuzzleDefinition } from '../engine/types';",
    '',
    '// TODO: Import ThemeGridCell, Difficulty, and ThemeDefinition from',
    '// src/engine/types.ts once they are defined there.',
    '',
    'interface ThemeGridCell {',
    '  puzzleId: string;',
    '  difficulty: "blue" | "green" | "yellow" | "orange" | "red";',
    '}',
    '',
    'interface ThemeDefinition {',
    '  id: string;',
    '  name: string;',
    '  description: string;',
    '  icon: string;',
    '  grid: (ThemeGridCell | null)[][];',
    '  puzzles: PuzzleDefinition[];',
    '}',
    '',
    `export const theme: ThemeDefinition = ${JSON.stringify(theme, null, 2)};`,
    '',
  ];
  return lines.join('\n');
}

main();
