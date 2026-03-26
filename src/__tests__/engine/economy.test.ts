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
