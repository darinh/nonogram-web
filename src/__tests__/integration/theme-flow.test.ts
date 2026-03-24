import { describe, it, expect } from 'vitest';
import {
  calculateReward,
  earnCoins,
  spendCoins,
  createEmptyWallet,
  getHintCost,
  applyRowHint,
  applyColHint,
  applyEdgeReveal,
  getEdgeCells,
  applyBomb,
  getDifficultyColor,
  getDifficultyLabel,
  getDifficultyOrder,
  CellState,
  Difficulty,
  COIN_REWARDS,
  HINT_COSTS,
  DEFAULT_BOMB_CONFIG,
  EDGE_REVEAL_COST,
  BOMB_COST,
} from '../../engine';

// ─── Coin + Reward Flow ────────────────────────────────────────────────────────

describe('Coin reward flow: calculateReward → earnCoins → spendCoins → getHintCost', () => {
  it('completes a full earn-then-spend cycle for each difficulty', () => {
    const difficulties: (typeof Difficulty)[keyof typeof Difficulty][] = [
      Difficulty.Blue,
      Difficulty.Green,
      Difficulty.Yellow,
      Difficulty.Orange,
      Difficulty.Red,
    ];

    let wallet = createEmptyWallet();

    // Earn coins for completing a puzzle at each difficulty
    for (const d of difficulties) {
      const reward = calculateReward(d);
      expect(reward).toBeGreaterThan(0);
      wallet = earnCoins(wallet, reward, `completed ${d} puzzle`);
    }

    // Total earned = sum of all rewards: 5+10+20+35+50 = 120
    const expectedTotal = Object.values(COIN_REWARDS).reduce((a, b) => a + b, 0);
    expect(wallet.coins).toBe(expectedTotal);
    expect(wallet.totalEarned).toBe(expectedTotal);
    expect(wallet.totalSpent).toBe(0);
    expect(wallet.transactions).toHaveLength(difficulties.length);

    // Now spend coins on hints at each difficulty
    for (const d of difficulties) {
      const cost = getHintCost(d);
      expect(cost).toBeGreaterThan(0);
      const result = spendCoins(wallet, cost, `hint for ${d}`);
      expect(result).not.toBeNull();
      wallet = result!;
    }

    // Total spent = sum of all hint costs: 3+5+8+12+15 = 43
    const expectedSpent = Object.values(HINT_COSTS).reduce((a, b) => a + b, 0);
    expect(wallet.totalSpent).toBe(expectedSpent);
    expect(wallet.coins).toBe(expectedTotal - expectedSpent);
  });

  it('prevents spending more than wallet balance', () => {
    let wallet = createEmptyWallet();
    wallet = earnCoins(wallet, 10, 'small reward');

    // Try to spend more than we have
    const result = spendCoins(wallet, 20, 'too expensive');
    expect(result).toBeNull();

    // Wallet unchanged
    expect(wallet.coins).toBe(10);
  });

  it('edge case: spending exact balance succeeds', () => {
    let wallet = createEmptyWallet();
    const reward = calculateReward(Difficulty.Blue); // 5
    wallet = earnCoins(wallet, reward, 'earned');
    const cost = getHintCost(Difficulty.Blue); // 3
    const result = spendCoins(wallet, cost, 'hint');
    expect(result).not.toBeNull();
    expect(result!.coins).toBe(reward - cost);

    // Spend the rest
    const final = spendCoins(result!, result!.coins, 'drain');
    expect(final).not.toBeNull();
    expect(final!.coins).toBe(0);
  });

  it('empty wallet starts clean', () => {
    const wallet = createEmptyWallet();
    expect(wallet.coins).toBe(0);
    expect(wallet.totalEarned).toBe(0);
    expect(wallet.totalSpent).toBe(0);
    expect(wallet.transactions).toEqual([]);
  });
});

// ─── Hint Flow ─────────────────────────────────────────────────────────────────

describe('Hint flow: apply hint on grid → verify state → check cost', () => {
  const size = 5;
  const solution = [
    1, 0, 1, 0, 1,
    0, 1, 0, 1, 0,
    1, 1, 1, 0, 0,
    0, 0, 1, 1, 1,
    1, 0, 0, 1, 0,
  ];

  it('applyRowHint reveals an entire row correctly', () => {
    const grid = new Array(25).fill(CellState.Empty);
    const revealed = applyRowHint(grid, solution, size, 2); // row 2: [1,1,1,0,0]

    // Row 2 starts at index 10
    expect(revealed[10]).toBe(CellState.Filled);
    expect(revealed[11]).toBe(CellState.Filled);
    expect(revealed[12]).toBe(CellState.Filled);
    expect(revealed[13]).toBe(CellState.Crossed);
    expect(revealed[14]).toBe(CellState.Crossed);

    // Other rows untouched
    expect(revealed[0]).toBe(CellState.Empty);
    expect(revealed[5]).toBe(CellState.Empty);
    expect(revealed[20]).toBe(CellState.Empty);
  });

  it('applyColHint reveals an entire column correctly', () => {
    const grid = new Array(25).fill(CellState.Empty);
    const revealed = applyColHint(grid, solution, size, 0); // col 0: [1,0,1,0,1]

    expect(revealed[0]).toBe(CellState.Filled);   // row 0
    expect(revealed[5]).toBe(CellState.Crossed);   // row 1
    expect(revealed[10]).toBe(CellState.Filled);   // row 2
    expect(revealed[15]).toBe(CellState.Crossed);  // row 3
    expect(revealed[20]).toBe(CellState.Filled);   // row 4

    // Other columns untouched
    expect(revealed[1]).toBe(CellState.Empty);
    expect(revealed[6]).toBe(CellState.Empty);
  });

  it('hint + coin flow: earn reward, spend on hint, verify wallet', () => {
    let wallet = createEmptyWallet();
    const difficulty = Difficulty.Yellow;

    // Complete a puzzle, earn coins
    wallet = earnCoins(wallet, calculateReward(difficulty), 'completed puzzle');
    expect(wallet.coins).toBe(20); // yellow reward = 20

    // Buy a hint
    const hintCost = getHintCost(difficulty);
    expect(hintCost).toBe(8); // yellow hint cost = 8

    const afterHint = spendCoins(wallet, hintCost, 'row hint');
    expect(afterHint).not.toBeNull();
    expect(afterHint!.coins).toBe(12); // 20 - 8

    // Apply the hint
    const grid = new Array(25).fill(CellState.Empty);
    const revealed = applyRowHint(grid, solution, size, 0);

    // Verify row 0 revealed correctly
    expect(revealed[0]).toBe(CellState.Filled);
    expect(revealed[1]).toBe(CellState.Crossed);
    expect(revealed[2]).toBe(CellState.Filled);
    expect(revealed[3]).toBe(CellState.Crossed);
    expect(revealed[4]).toBe(CellState.Filled);
  });

  it('hints do not mutate the original grid', () => {
    const grid = new Array(25).fill(CellState.Empty);
    const copy = [...grid];
    applyRowHint(grid, solution, size, 0);
    applyColHint(grid, solution, size, 0);
    expect(grid).toEqual(copy);
  });

  it('applying hint twice on same row is idempotent', () => {
    const grid = new Array(25).fill(CellState.Empty);
    const first = applyRowHint(grid, solution, size, 1);
    const second = applyRowHint(first, solution, size, 1);
    expect(second).toEqual(first);
  });
});

// ─── Power-up Flow ─────────────────────────────────────────────────────────────

describe('Power-up flow: edge reveal + bomb', () => {
  it('applyEdgeReveal reveals all perimeter cells', () => {
    const size = 5;
    const grid = new Array(25).fill(CellState.Empty);
    const solution = new Array(25).fill(1);
    solution[0] = 0;  // top-left empty
    solution[24] = 0; // bottom-right empty

    const revealed = applyEdgeReveal(grid, solution, size);
    const edges = getEdgeCells(size);

    // All 16 edge cells should be revealed
    expect(edges).toHaveLength(16);
    for (const i of edges) {
      if (solution[i] === 1) {
        expect(revealed[i]).toBe(CellState.Filled);
      } else {
        expect(revealed[i]).toBe(CellState.Crossed);
      }
    }

    // Interior cells (6,7,8,11,12,13,16,17,18) remain empty
    const interiorCells = [6, 7, 8, 11, 12, 13, 16, 17, 18];
    for (const i of interiorCells) {
      expect(revealed[i]).toBe(CellState.Empty);
    }
  });

  it('edge reveal + coin cost integration', () => {
    let wallet = createEmptyWallet();

    // Earn coins from two red puzzles (50 each = 100)
    wallet = earnCoins(wallet, calculateReward(Difficulty.Red), 'puzzle 1');
    wallet = earnCoins(wallet, calculateReward(Difficulty.Red), 'puzzle 2');
    expect(wallet.coins).toBe(100);

    // Edge reveal costs 25
    expect(EDGE_REVEAL_COST).toBe(25);
    const afterEdge = spendCoins(wallet, EDGE_REVEAL_COST, 'edge reveal');
    expect(afterEdge).not.toBeNull();
    expect(afterEdge!.coins).toBe(75);

    // Apply the reveal
    const size = 5;
    const grid = new Array(25).fill(CellState.Empty);
    const solution = new Array(25).fill(1);
    const revealed = applyEdgeReveal(grid, solution, size);

    // Verify edges revealed
    const edges = getEdgeCells(size);
    for (const i of edges) {
      expect(revealed[i]).toBe(CellState.Filled);
    }
  });

  it('applyBomb reveals cells and caps at 20% of grid', () => {
    const size = 10;
    const grid = new Array(100).fill(CellState.Empty);
    const solution = new Array(100).fill(1);
    const config: { explosionCount: number; minRadius: number; maxRadius: number } = { explosionCount: 3, minRadius: 1, maxRadius: 2 };

    const result = applyBomb(grid, solution, size, config);

    // Should reveal some cells
    expect(result.revealedPositions.length).toBeGreaterThan(0);

    // Capped at 20% = 20 cells for 10x10
    expect(result.revealedPositions.length).toBeLessThanOrEqual(20);

    // All revealed cells should be Filled (since solution is all 1s)
    for (const pos of result.revealedPositions) {
      expect(result.grid[pos]).toBe(CellState.Filled);
    }
  });

  it('bomb + coin cost integration', () => {
    let wallet = createEmptyWallet();
    wallet = earnCoins(wallet, 50, 'big puzzle');

    expect(BOMB_COST).toBe(30);
    const afterBomb = spendCoins(wallet, BOMB_COST, 'bomb power-up');
    expect(afterBomb).not.toBeNull();
    expect(afterBomb!.coins).toBe(20);
  });

  it('applyBomb does not mutate original grid', () => {
    const size = 5;
    const grid = new Array(25).fill(CellState.Empty);
    const original = [...grid];
    const solution = new Array(25).fill(1);

    applyBomb(grid, solution, size, DEFAULT_BOMB_CONFIG);
    expect(grid).toEqual(original);
  });

  it('getEdgeCells returns correct counts for all grid sizes', () => {
    // 5x5: 4*5-4 = 16 edges
    expect(getEdgeCells(5)).toHaveLength(16);
    // 10x10: 4*10-4 = 36 edges
    expect(getEdgeCells(10)).toHaveLength(36);
    // 15x15: 4*15-4 = 56 edges
    expect(getEdgeCells(15)).toHaveLength(56);
    // Edge case: 1x1 grid has 1 edge cell
    expect(getEdgeCells(1)).toHaveLength(1);
    // Edge case: 0 returns empty
    expect(getEdgeCells(0)).toHaveLength(0);
  });
});

// ─── Difficulty System ─────────────────────────────────────────────────────────

describe('Difficulty system: 5 tiers with correct colors, labels, and rewards', () => {
  const allDifficulties: (typeof Difficulty)[keyof typeof Difficulty][] = [
    Difficulty.Blue,
    Difficulty.Green,
    Difficulty.Yellow,
    Difficulty.Orange,
    Difficulty.Red,
  ];

  it('all 5 difficulty tiers exist', () => {
    expect(allDifficulties).toHaveLength(5);
    expect(Difficulty.Blue).toBe('blue');
    expect(Difficulty.Green).toBe('green');
    expect(Difficulty.Yellow).toBe('yellow');
    expect(Difficulty.Orange).toBe('orange');
    expect(Difficulty.Red).toBe('red');
  });

  it('each tier has a unique hex color', () => {
    const colors = allDifficulties.map(getDifficultyColor);
    const unique = new Set(colors);
    expect(unique.size).toBe(5);

    // All should be hex colors
    for (const color of colors) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('each tier has a non-empty label', () => {
    const labels = allDifficulties.map(getDifficultyLabel);
    for (const label of labels) {
      expect(label.length).toBeGreaterThan(0);
    }
    // Labels should be unique
    expect(new Set(labels).size).toBe(5);
  });

  it('difficulty order is monotonically increasing', () => {
    const orders = allDifficulties.map(getDifficultyOrder);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBeGreaterThan(orders[i - 1]);
    }
  });

  it('rewards increase with difficulty', () => {
    const rewards = allDifficulties.map(calculateReward);
    for (let i = 1; i < rewards.length; i++) {
      expect(rewards[i]).toBeGreaterThan(rewards[i - 1]);
    }
  });

  it('hint costs increase with difficulty', () => {
    const costs = allDifficulties.map(getHintCost);
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i]).toBeGreaterThan(costs[i - 1]);
    }
  });

  it('reward always exceeds hint cost at every difficulty', () => {
    for (const d of allDifficulties) {
      const reward = calculateReward(d);
      const hintCost = getHintCost(d);
      expect(reward).toBeGreaterThan(hintCost);
    }
  });
});

// ─── Cross-system Integration ──────────────────────────────────────────────────

describe('Cross-system: full puzzle solve simulation', () => {
  it('simulates: earn reward → buy hint → apply hint → buy edge reveal → apply edge reveal', () => {
    const size = 5;
    const solution = [
      1, 0, 1, 0, 1,
      0, 1, 0, 1, 0,
      1, 1, 1, 0, 0,
      0, 0, 1, 1, 1,
      1, 0, 0, 1, 0,
    ];
    let grid = new Array(25).fill(CellState.Empty);
    let wallet = createEmptyWallet();
    const difficulty = Difficulty.Red;

    // Step 1: Earn reward from a previous puzzle
    wallet = earnCoins(wallet, calculateReward(difficulty), 'prev puzzle');
    expect(wallet.coins).toBe(50);

    // Step 2: Buy and apply a row hint
    const hintCost = getHintCost(difficulty);
    wallet = spendCoins(wallet, hintCost, 'row 0 hint')!;
    grid = applyRowHint(grid, solution, size, 0);

    // Verify: row 0 revealed, coins deducted
    expect(grid[0]).toBe(CellState.Filled);
    expect(grid[1]).toBe(CellState.Crossed);
    expect(wallet.coins).toBe(50 - hintCost);

    // Step 3: Buy and apply edge reveal
    wallet = spendCoins(wallet, EDGE_REVEAL_COST, 'edge reveal')!;
    grid = applyEdgeReveal(grid, solution, size);

    // Verify: all edges revealed (including row 0 which was already hinted)
    const edges = getEdgeCells(size);
    for (const i of edges) {
      expect(grid[i]).not.toBe(CellState.Empty);
    }
    expect(wallet.coins).toBe(50 - hintCost - EDGE_REVEAL_COST);

    // Step 4: Verify transaction history
    expect(wallet.transactions).toHaveLength(3);
    expect(wallet.transactions[0].type).toBe('spend'); // edge reveal (most recent first)
    expect(wallet.transactions[1].type).toBe('spend'); // hint
    expect(wallet.transactions[2].type).toBe('earn');  // puzzle reward
  });
});
