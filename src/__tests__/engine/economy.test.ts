import { describe, it, expect } from 'vitest';
import {
  createEmptyDualWallet,
  earnTokens,
  spendTokens,
  earnDualCoins,
  spendDualCoins,
  calculateCoinReward,
  getHintCoinCost,
} from '../../engine/economy';
import {
  STARTING_TOKENS,
  STARTING_COINS,
  PLAY_COST,
  REPLAY_COIN_COST,
  REPLAY_TOKEN_REWARD,
} from '../../engine/constants';
import type { DualWalletState } from '../../engine/types';

describe('createEmptyDualWallet', () => {
  it('returns a wallet with starting balances and no transactions', () => {
    const wallet = createEmptyDualWallet();
    expect(wallet).toEqual({
      tokens: STARTING_TOKENS,
      coins: STARTING_COINS,
      totalTokensEarned: STARTING_TOKENS,
      totalTokensSpent: 0,
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      transactions: [],
    });
  });
});

describe('economy constants', () => {
  it('has correct starting values', () => {
    expect(STARTING_TOKENS).toBe(10);
    expect(STARTING_COINS).toBe(0);
  });

  it('has correct play/replay costs', () => {
    expect(PLAY_COST).toBe(1);
    expect(REPLAY_COIN_COST).toBe(5);
    expect(REPLAY_TOKEN_REWARD).toBe(1);
  });
});

describe('earnTokens', () => {
  it('adds tokens and records a transaction', () => {
    const wallet = createEmptyDualWallet();
    const updated = earnTokens(wallet, 5, 'replay bonus');
    expect(updated.tokens).toBe(STARTING_TOKENS + 5);
    expect(updated.totalTokensEarned).toBe(STARTING_TOKENS + 5);
    expect(updated.totalTokensSpent).toBe(0);
    expect(updated.coins).toBe(STARTING_COINS);
    expect(updated.transactions).toHaveLength(1);
    expect(updated.transactions[0]).toMatchObject({
      type: 'earn',
      currency: 'tokens',
      amount: 5,
      reason: 'replay bonus',
    });
  });

  it('does not mutate the original wallet', () => {
    const wallet = createEmptyDualWallet();
    earnTokens(wallet, 5, 'test');
    expect(wallet.tokens).toBe(STARTING_TOKENS);
    expect(wallet.transactions).toHaveLength(0);
  });

  it('trims transactions to MAX_TRANSACTIONS', () => {
    let wallet: DualWalletState = createEmptyDualWallet();
    for (let i = 0; i < 105; i++) {
      wallet = earnTokens(wallet, 1, `tx-${i}`);
    }
    expect(wallet.transactions).toHaveLength(100);
    expect(wallet.transactions[0].reason).toBe('tx-104');
  });
});

describe('spendTokens', () => {
  it('deducts tokens and records a transaction', () => {
    const wallet = createEmptyDualWallet();
    const updated = spendTokens(wallet, PLAY_COST, 'play puzzle');
    expect(updated).not.toBeNull();
    expect(updated!.tokens).toBe(STARTING_TOKENS - PLAY_COST);
    expect(updated!.totalTokensSpent).toBe(PLAY_COST);
    expect(updated!.transactions[0]).toMatchObject({
      type: 'spend',
      currency: 'tokens',
      amount: PLAY_COST,
      reason: 'play puzzle',
    });
  });

  it('returns null for insufficient tokens', () => {
    const wallet = { ...createEmptyDualWallet(), tokens: 0 };
    const result = spendTokens(wallet, 1, 'no tokens');
    expect(result).toBeNull();
  });

  it('allows spending exact balance', () => {
    const wallet = { ...createEmptyDualWallet(), tokens: 1 };
    const result = spendTokens(wallet, 1, 'last token');
    expect(result).not.toBeNull();
    expect(result!.tokens).toBe(0);
  });

  it('does not affect coin balance', () => {
    const wallet = earnDualCoins(createEmptyDualWallet(), 50, 'earned');
    const updated = spendTokens(wallet, 1, 'play');
    expect(updated).not.toBeNull();
    expect(updated!.coins).toBe(50);
  });
});

describe('earnDualCoins', () => {
  it('adds coins and records a transaction', () => {
    const wallet = createEmptyDualWallet();
    const updated = earnDualCoins(wallet, 10, 'puzzle complete');
    expect(updated.coins).toBe(10);
    expect(updated.totalCoinsEarned).toBe(10);
    expect(updated.totalCoinsSpent).toBe(0);
    expect(updated.tokens).toBe(STARTING_TOKENS);
    expect(updated.transactions).toHaveLength(1);
    expect(updated.transactions[0]).toMatchObject({
      type: 'earn',
      currency: 'coins',
      amount: 10,
      reason: 'puzzle complete',
    });
  });

  it('does not mutate the original wallet', () => {
    const wallet = createEmptyDualWallet();
    earnDualCoins(wallet, 10, 'test');
    expect(wallet.coins).toBe(STARTING_COINS);
    expect(wallet.transactions).toHaveLength(0);
  });
});

describe('spendDualCoins', () => {
  it('deducts coins and records a transaction', () => {
    const wallet = earnDualCoins(createEmptyDualWallet(), 50, 'earned');
    const updated = spendDualCoins(wallet, 20, 'hint');
    expect(updated).not.toBeNull();
    expect(updated!.coins).toBe(30);
    expect(updated!.totalCoinsSpent).toBe(20);
    expect(updated!.transactions[0]).toMatchObject({
      type: 'spend',
      currency: 'coins',
      amount: 20,
      reason: 'hint',
    });
  });

  it('returns null for insufficient coins', () => {
    const wallet = createEmptyDualWallet();
    const result = spendDualCoins(wallet, 10, 'too expensive');
    expect(result).toBeNull();
  });

  it('allows spending exact balance', () => {
    const wallet = earnDualCoins(createEmptyDualWallet(), 25, 'earned');
    const result = spendDualCoins(wallet, 25, 'all in');
    expect(result).not.toBeNull();
    expect(result!.coins).toBe(0);
  });

  it('does not affect token balance', () => {
    const wallet = earnDualCoins(createEmptyDualWallet(), 50, 'earned');
    const updated = spendDualCoins(wallet, 20, 'hint');
    expect(updated).not.toBeNull();
    expect(updated!.tokens).toBe(STARTING_TOKENS);
  });
});

describe('calculateCoinReward', () => {
  it('returns correct reward for each difficulty', () => {
    expect(calculateCoinReward('blue')).toBe(5);
    expect(calculateCoinReward('green')).toBe(10);
    expect(calculateCoinReward('yellow')).toBe(20);
    expect(calculateCoinReward('orange')).toBe(35);
    expect(calculateCoinReward('red')).toBe(50);
  });
});

describe('getHintCoinCost', () => {
  it('returns correct cost for each difficulty', () => {
    expect(getHintCoinCost('blue')).toBe(3);
    expect(getHintCoinCost('green')).toBe(5);
    expect(getHintCoinCost('yellow')).toBe(8);
    expect(getHintCoinCost('orange')).toBe(12);
    expect(getHintCoinCost('red')).toBe(15);
  });

  it('returns default cost when difficulty is undefined', () => {
    expect(getHintCoinCost(undefined)).toBe(8);
  });
});

describe('dual-currency flow', () => {
  it('play → earn coins → spend coins for hint', () => {
    let wallet = createEmptyDualWallet();

    // Spend a token to play
    wallet = spendTokens(wallet, PLAY_COST, 'play blue puzzle')!;
    expect(wallet.tokens).toBe(STARTING_TOKENS - PLAY_COST);

    // Earn coins for completing
    const reward = calculateCoinReward('blue');
    wallet = earnDualCoins(wallet, reward, 'completed blue puzzle');
    expect(wallet.coins).toBe(reward);

    // Spend coins on a hint
    const hintCost = getHintCoinCost('blue');
    wallet = spendDualCoins(wallet, hintCost, 'row hint')!;
    expect(wallet.coins).toBe(reward - hintCost);
  });

  it('replay → spend coins, earn token', () => {
    let wallet = earnDualCoins(createEmptyDualWallet(), 50, 'previous earnings');

    // Spend coins to replay
    wallet = spendDualCoins(wallet, REPLAY_COIN_COST, 'replay puzzle')!;
    expect(wallet.coins).toBe(50 - REPLAY_COIN_COST);

    // Earn a token for replaying
    wallet = earnTokens(wallet, REPLAY_TOKEN_REWARD, 'replay reward');
    expect(wallet.tokens).toBe(STARTING_TOKENS + REPLAY_TOKEN_REWARD);
  });

  it('tracks both currency totals independently', () => {
    let wallet = createEmptyDualWallet();
    wallet = earnTokens(wallet, 5, 'bonus');
    wallet = spendTokens(wallet, 3, 'play')!;
    wallet = earnDualCoins(wallet, 20, 'reward');
    wallet = spendDualCoins(wallet, 8, 'hint')!;

    expect(wallet.totalTokensEarned).toBe(STARTING_TOKENS + 5);
    expect(wallet.totalTokensSpent).toBe(3);
    expect(wallet.totalCoinsEarned).toBe(20);
    expect(wallet.totalCoinsSpent).toBe(8);
    expect(wallet.transactions).toHaveLength(4);
  });
});


describe('token spend for playing', () => {
  it('deducts exactly PLAY_COST token to start a puzzle', () => {
    const wallet = createEmptyDualWallet();
    const updated = spendTokens(wallet, PLAY_COST, 'play puzzle abc');
    expect(updated).not.toBeNull();
    expect(updated!.tokens).toBe(STARTING_TOKENS - PLAY_COST);
    expect(updated!.transactions[0].currency).toBe('tokens');
    expect(updated!.transactions[0].amount).toBe(PLAY_COST);
  });

  it('prevents playing when tokens are exhausted', () => {
    let wallet = createEmptyDualWallet();
    for (let i = 0; i < STARTING_TOKENS; i++) {
      wallet = spendTokens(wallet, PLAY_COST, `play ${i}`)!;
    }
    expect(wallet.tokens).toBe(0);
    const result = spendTokens(wallet, PLAY_COST, 'one more');
    expect(result).toBeNull();
  });

  it('tracks cumulative token spending across multiple plays', () => {
    let wallet = createEmptyDualWallet();
    wallet = spendTokens(wallet, PLAY_COST, 'play 1')!;
    wallet = spendTokens(wallet, PLAY_COST, 'play 2')!;
    wallet = spendTokens(wallet, PLAY_COST, 'play 3')!;
    expect(wallet.totalTokensSpent).toBe(3 * PLAY_COST);
    expect(wallet.tokens).toBe(STARTING_TOKENS - 3 * PLAY_COST);
  });
});

describe('coin earn on puzzle completion', () => {
  it('awards correct coins for each difficulty tier', () => {
    const difficulties: Array<'blue' | 'green' | 'yellow' | 'orange' | 'red'> = [
      'blue', 'green', 'yellow', 'orange', 'red',
    ];
    const expectedRewards = [5, 10, 20, 35, 50];

    for (let i = 0; i < difficulties.length; i++) {
      let wallet = createEmptyDualWallet();
      const reward = calculateCoinReward(difficulties[i]);
      expect(reward).toBe(expectedRewards[i]);
      wallet = earnDualCoins(wallet, reward, `completed ${difficulties[i]}`);
      expect(wallet.coins).toBe(expectedRewards[i]);
      expect(wallet.totalCoinsEarned).toBe(expectedRewards[i]);
    }
  });

  it('accumulates coins from completing multiple puzzles', () => {
    let wallet = createEmptyDualWallet();
    wallet = earnDualCoins(wallet, calculateCoinReward('blue'), 'puzzle 1');
    wallet = earnDualCoins(wallet, calculateCoinReward('green'), 'puzzle 2');
    wallet = earnDualCoins(wallet, calculateCoinReward('yellow'), 'puzzle 3');
    expect(wallet.coins).toBe(5 + 10 + 20);
    expect(wallet.totalCoinsEarned).toBe(35);
  });
});

describe('replay mechanics', () => {
  it('requires REPLAY_COIN_COST coins to replay a completed puzzle', () => {
    const wallet = earnDualCoins(createEmptyDualWallet(), 50, 'earnings');
    const updated = spendDualCoins(wallet, REPLAY_COIN_COST, 'replay');
    expect(updated).not.toBeNull();
    expect(updated!.coins).toBe(50 - REPLAY_COIN_COST);
    expect(updated!.transactions[0]).toMatchObject({
      type: 'spend',
      currency: 'coins',
      amount: REPLAY_COIN_COST,
    });
  });

  it('awards REPLAY_TOKEN_REWARD token after replay', () => {
    let wallet = earnDualCoins(createEmptyDualWallet(), 50, 'earnings');
    wallet = spendDualCoins(wallet, REPLAY_COIN_COST, 'replay')!;
    wallet = earnTokens(wallet, REPLAY_TOKEN_REWARD, 'replay bonus');
    expect(wallet.tokens).toBe(STARTING_TOKENS + REPLAY_TOKEN_REWARD);
  });

  it('replay cycle: spend coins, complete, earn token, net positive loop', () => {
    let wallet = earnDualCoins(createEmptyDualWallet(), 100, 'initial');

    // Replay cycle
    wallet = spendDualCoins(wallet, REPLAY_COIN_COST, 'replay puzzle')!;
    wallet = earnDualCoins(wallet, calculateCoinReward('green'), 'completed replay');
    wallet = earnTokens(wallet, REPLAY_TOKEN_REWARD, 'replay token');

    expect(wallet.coins).toBe(100 - REPLAY_COIN_COST + calculateCoinReward('green'));
    expect(wallet.tokens).toBe(STARTING_TOKENS + REPLAY_TOKEN_REWARD);
    expect(wallet.transactions).toHaveLength(4);
  });

  it('prevents replay when coins are insufficient', () => {
    const wallet = createEmptyDualWallet();
    const result = spendDualCoins(wallet, REPLAY_COIN_COST, 'replay');
    expect(result).toBeNull();
  });
});

describe('hint and power-up purchases', () => {
  it('deducts correct hint cost by difficulty', () => {
    const wallet = earnDualCoins(createEmptyDualWallet(), 100, 'earnings');
    const hintCost = getHintCoinCost('yellow');
    expect(hintCost).toBe(8);
    const updated = spendDualCoins(wallet, hintCost, 'hint')!;
    expect(updated.coins).toBe(92);
  });

  it('prevents hint purchase with insufficient coins', () => {
    const wallet = earnDualCoins(createEmptyDualWallet(), 2, 'small earn');
    const hintCost = getHintCoinCost('blue');
    const result = spendDualCoins(wallet, hintCost, 'hint');
    expect(result).toBeNull();
  });
});

describe('dual transaction history', () => {
  it('interleaves token and coin transactions in order', () => {
    let wallet = createEmptyDualWallet();
    wallet = spendTokens(wallet, 1, 'play')!;
    wallet = earnDualCoins(wallet, 10, 'reward');
    wallet = spendDualCoins(wallet, 3, 'hint')!;
    wallet = earnTokens(wallet, 1, 'replay bonus');

    expect(wallet.transactions).toHaveLength(4);
    expect(wallet.transactions[0]).toMatchObject({ currency: 'tokens', type: 'earn' });
    expect(wallet.transactions[1]).toMatchObject({ currency: 'coins', type: 'spend' });
    expect(wallet.transactions[2]).toMatchObject({ currency: 'coins', type: 'earn' });
    expect(wallet.transactions[3]).toMatchObject({ currency: 'tokens', type: 'spend' });
  });

  it('caps mixed transactions at MAX_TRANSACTIONS', () => {
    let wallet = createEmptyDualWallet();
    for (let i = 0; i < 60; i++) {
      wallet = earnTokens(wallet, 1, `token-${i}`);
    }
    for (let i = 0; i < 60; i++) {
      wallet = earnDualCoins(wallet, 1, `coin-${i}`);
    }
    expect(wallet.transactions).toHaveLength(100);
    expect(wallet.transactions[0].currency).toBe('coins');
  });

  it('each transaction has a valid ISO timestamp', () => {
    let wallet = createEmptyDualWallet();
    wallet = earnTokens(wallet, 5, 'bonus');
    wallet = earnDualCoins(wallet, 10, 'reward');

    for (const tx of wallet.transactions) {
      expect(tx.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(() => new Date(tx.timestamp)).not.toThrow();
    }
  });
});

describe('full multi-puzzle session', () => {
  it('simulates a complete play session with multiple puzzles', () => {
    let wallet = createEmptyDualWallet();

    // Play blue puzzle
    wallet = spendTokens(wallet, PLAY_COST, 'play blue')!;
    wallet = earnDualCoins(wallet, calculateCoinReward('blue'), 'complete blue');

    // Play green puzzle
    wallet = spendTokens(wallet, PLAY_COST, 'play green')!;
    wallet = earnDualCoins(wallet, calculateCoinReward('green'), 'complete green');

    // Buy a hint during yellow puzzle
    wallet = spendTokens(wallet, PLAY_COST, 'play yellow')!;
    wallet = spendDualCoins(wallet, getHintCoinCost('yellow'), 'hint yellow')!;
    wallet = earnDualCoins(wallet, calculateCoinReward('yellow'), 'complete yellow');

    // Replay blue for token
    wallet = spendDualCoins(wallet, REPLAY_COIN_COST, 'replay blue')!;
    wallet = earnTokens(wallet, REPLAY_TOKEN_REWARD, 'replay reward');

    // Verify final state
    expect(wallet.tokens).toBe(STARTING_TOKENS - 3 * PLAY_COST + REPLAY_TOKEN_REWARD);
    expect(wallet.coins).toBe(5 + 10 + 20 - 8 - 5);
    expect(wallet.totalTokensSpent).toBe(3 * PLAY_COST);
    expect(wallet.totalTokensEarned).toBe(STARTING_TOKENS + REPLAY_TOKEN_REWARD);
    expect(wallet.totalCoinsEarned).toBe(5 + 10 + 20);
    expect(wallet.totalCoinsSpent).toBe(8 + 5);
    expect(wallet.transactions).toHaveLength(9);
  });
});

describe('v1 wallet migration helpers', () => {
  it('createEmptyDualWallet starts with STARTING_TOKENS and 0 coins', () => {
    const wallet = createEmptyDualWallet();
    expect(wallet.tokens).toBe(STARTING_TOKENS);
    expect(wallet.coins).toBe(0);
    expect(wallet.totalTokensEarned).toBe(STARTING_TOKENS);
    expect(wallet.totalTokensSpent).toBe(0);
    expect(wallet.totalCoinsEarned).toBe(0);
    expect(wallet.totalCoinsSpent).toBe(0);
    expect(wallet.transactions).toEqual([]);
  });

  it('a wallet with existing coins can operate on tokens independently', () => {
    let wallet = createEmptyDualWallet();
    wallet = { ...wallet, coins: 75, totalCoinsEarned: 100, totalCoinsSpent: 25 };

    wallet = spendTokens(wallet, PLAY_COST, 'play')!;
    expect(wallet.tokens).toBe(STARTING_TOKENS - PLAY_COST);
    expect(wallet.coins).toBe(75);

    wallet = earnTokens(wallet, REPLAY_TOKEN_REWARD, 'bonus');
    expect(wallet.coins).toBe(75);
  });
});
